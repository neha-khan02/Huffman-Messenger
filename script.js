let huffmanCodes = {};
let encodedMessage = "";
let huffmanTree = null;


// ===============================
// GET CHARACTER FREQUENCY
// ===============================

function getFrequency(message) {

    const frequency = {};

    for (let char of message) {

        if (frequency[char]) {
            frequency[char]++;
        } else {
            frequency[char] = 1;
        }
    }

    return frequency;
}


// ===============================
// CREATE HUFFMAN TREE
// ===============================

function createHuffmanTree(frequency) {

    let nodes = Object.keys(frequency).map(char => ({
        char: char,
        freq: frequency[char],
        left: null,
        right: null
    }));


    while (nodes.length > 1) {

        nodes.sort((a, b) => a.freq - b.freq);

        const left = nodes.shift();
        const right = nodes.shift();

        const newNode = {
            char: null,
            freq: left.freq + right.freq,
            left: left,
            right: right
        };

        nodes.push(newNode);
    }


    return nodes[0];
}


// ===============================
// GENERATE HUFFMAN CODES
// ===============================

function generateCodes(node, code = "") {

    if (!node) return;


    if (node.char !== null) {

        huffmanCodes[node.char] =
            code === "" ? "0" : code;

        return;
    }


    generateCodes(node.left, code + "0");

    generateCodes(node.right, code + "1");
}


// ===============================
// ENCODE
// ===============================

function encode(message) {

    let result = "";

    for (let char of message) {

        result += huffmanCodes[char];
    }

    return result;
}


// ===============================
// ENCODE MESSAGE
// ===============================

function encodeMessage() {

    const message =
        document.getElementById("message").value;


    if (!message.trim()) {

        alert("Please enter a message.");

        return;
    }


    // Character Frequency

    const frequency =
        getFrequency(message);


    let frequencyHTML = `
        <table>
            <thead>
                <tr>
                    <th>Character</th>
                    <th>Frequency</th>
                </tr>
            </thead>
            <tbody>
    `;


    for (let char in frequency) {

        const displayChar =
            char === " " ? "Space" : char;

        frequencyHTML += `
            <tr>
                <td>${displayChar}</td>
                <td>${frequency[char]}</td>
            </tr>
        `;
    }


    frequencyHTML += `
            </tbody>
        </table>
    `;


    document.getElementById("frequency").innerHTML =
        frequencyHTML;


    // Create Huffman Tree

    huffmanTree =
        createHuffmanTree(frequency);


    // Generate Codes

    huffmanCodes = {};

    generateCodes(huffmanTree);


    // Show Binary Codes

    let codesHTML = `
        <table>
            <thead>
                <tr>
                    <th>Character</th>
                    <th>Code</th>
                </tr>
            </thead>
            <tbody>
    `;


    for (let char in huffmanCodes) {

        const displayChar =
            char === " " ? "Space" : char;

        codesHTML += `
            <tr>
                <td>${displayChar}</td>
                <td><strong>${huffmanCodes[char]}</strong></td>
            </tr>
        `;
    }


    codesHTML += `
            </tbody>
        </table>
    `;


    document.getElementById("codes").innerHTML =
        codesHTML;


    // Encode Message

    encodedMessage =
        encode(message);


    document.getElementById("encoded").textContent =
        encodedMessage;


    // Draw Tree

    drawTree(huffmanTree);


    // Reset Decode Area

    document.getElementById("decodeProcess").innerHTML =
        `<span class="placeholder">
            Decode the message to see the process.
        </span>`;


    document.getElementById("finalMessage").textContent =
        "Waiting for decoded message...";
}


// ===============================
// OPTIMIZED HUFFMAN TREE
// ===============================

function drawTree(root) {

    const svg =
        document.getElementById("tree");


    // Remove old tree efficiently

    svg.replaceChildren();


    if (!root) return;


    // =========================
    // COLLECT LEAVES
    // =========================

    const leaves = [];


    function collectLeaves(node) {

        if (!node) return;


        if (node.char !== null) {

            leaves.push(node);

            return;
        }


        collectLeaves(node.left);
        collectLeaves(node.right);
    }


    collectLeaves(root);


    // =========================
    // TREE SIZE
    // =========================

    const leafGap =
        Math.max(
            100,
            Math.min(
                135,
                1000 / Math.max(leaves.length, 1)
            )
        );


    const leftMargin = 60;


    const width =
        Math.max(
            700,
            leftMargin +
            (leaves.length - 1) * leafGap +
            100
        );


    function getDepth(node) {

        if (!node) return 0;


        return 1 +
            Math.max(
                getDepth(node.left),
                getDepth(node.right)
            );
    }


    const depth =
        getDepth(root);


    const levelGap = 70;


    const height =
        Math.max(
            420,
            depth * levelGap + 70
        );


    svg.setAttribute(
        "width",
        width
    );


    svg.setAttribute(
        "height",
        height
    );


    svg.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );


    // =========================
    // POSITION NODES
    // =========================

    const positions =
        new Map();


    leaves.forEach((leaf, index) => {

        positions.set(
            leaf,
            {
                x: leftMargin + index * leafGap,
                y: height - 50
            }
        );

    });


    function positionNodes(
        node,
        level = 0
    ) {

        if (
            !node ||
            node.char !== null
        ) {
            return;
        }


        positionNodes(
            node.left,
            level + 1
        );


        positionNodes(
            node.right,
            level + 1
        );


        const left =
            positions.get(node.left);


        const right =
            positions.get(node.right);


        if (left && right) {

            positions.set(
                node,
                {
                    x: (left.x + right.x) / 2,
                    y: 40 + level * levelGap
                }
            );

        } else if (left) {

            positions.set(
                node,
                {
                    x: left.x,
                    y: 40 + level * levelGap
                }
            );

        } else if (right) {

            positions.set(
                node,
                {
                    x: right.x,
                    y: 40 + level * levelGap
                }
            );
        }
    }


    positionNodes(root);


    // =========================
    // SVG HELPER
    // =========================

    const NS =
        "http://www.w3.org/2000/svg";


    function createSVGElement(
        type,
        attributes = {},
        text = ""
    ) {

        const element =
            document.createElementNS(
                NS,
                type
            );


        for (
            const key in attributes
        ) {

            element.setAttribute(
                key,
                attributes[key]
            );
        }


        if (text) {

            element.textContent =
                text;
        }


        return element;
    }


    // =========================
    // DOCUMENT FRAGMENT
    // =========================

    const fragment =
        document.createDocumentFragment();


    // =========================
    // DRAW TREE
    // =========================

    function drawNode(node) {

        if (!node) return;


        const pos =
            positions.get(node);


        if (!pos) return;


        // LEFT CONNECTION

        if (node.left) {

            const child =
                positions.get(node.left);


            if (child) {

                fragment.appendChild(
                    createSVGElement(
                        "line",
                        {
                            x1: pos.x,
                            y1: pos.y,
                            x2: child.x,
                            y2: child.y,
                            class: "tree-line"
                        }
                    )
                );


                fragment.appendChild(
                    createSVGElement(
                        "text",
                        {
                            x:
                                (pos.x + child.x) / 2 - 7,
                            y:
                                (pos.y + child.y) / 2 - 5,
                            class: "tree-bit"
                        },
                        "0"
                    )
                );
            }
        }


        // RIGHT CONNECTION

        if (node.right) {

            const child =
                positions.get(node.right);


            if (child) {

                fragment.appendChild(
                    createSVGElement(
                        "line",
                        {
                            x1: pos.x,
                            y1: pos.y,
                            x2: child.x,
                            y2: child.y,
                            class: "tree-line"
                        }
                    )
                );


                fragment.appendChild(
                    createSVGElement(
                        "text",
                        {
                            x:
                                (pos.x + child.x) / 2 + 5,
                            y:
                                (pos.y + child.y) / 2 - 5,
                            class: "tree-bit"
                        },
                        "1"
                    )
                );
            }
        }


        // NODE CIRCLE

        fragment.appendChild(
            createSVGElement(
                "circle",
                {
                    cx: pos.x,
                    cy: pos.y,
                    r: 23,
                    class:
                        node.char !== null
                            ? "tree-node leaf"
                            : "tree-node internal"
                }
            )
        );


        // FREQUENCY

        fragment.appendChild(
            createSVGElement(
                "text",
                {
                    x: pos.x,
                    y: pos.y + 4,
                    class: "tree-frequency"
                },
                String(node.freq)
            )
        );


        // CHARACTER

        if (node.char !== null) {

            fragment.appendChild(
                createSVGElement(
                    "text",
                    {
                        x: pos.x,
                        y: pos.y + 41,
                        class: "tree-label"
                    },
                    node.char === " "
                        ? "Space"
                        : node.char
                )
            );
        }


        drawNode(node.left);

        drawNode(node.right);
    }


    drawNode(root);


    // Add all SVG elements at once

    svg.appendChild(fragment);
}


// ===============================
// DECODE MESSAGE
// ===============================

function decodeMessage() {

    if (
        !encodedMessage ||
        !huffmanTree
    ) {

        alert(
            "Please encode a message first."
        );

        return;
    }


    let current =
        huffmanTree;


    let decoded = "";


    let processHTML = `
        <table>

            <thead>

                <tr>
                    <th>Step</th>
                    <th>Bit Read</th>
                    <th>Bits Taken</th>
                    <th>Tree Movement</th>
                    <th>Character</th>
                    <th>Action</th>
                </tr>

            </thead>

            <tbody>
    `;


    let step = 0;

    let bitsTaken = "";


    // =========================
    // SINGLE CHARACTER
    // =========================

    if (
        huffmanTree.left === null &&
        huffmanTree.right === null
    ) {

        for (
            let i = 0;
            i < encodedMessage.length;
            i++
        ) {

            step++;


            bitsTaken +=
                encodedMessage[i];


            decoded +=
                huffmanTree.char;


            processHTML += `
                <tr>

                    <td>${step}</td>

                    <td>
                        ${encodedMessage[i]}
                    </td>

                    <td>
                        ${bitsTaken}
                    </td>

                    <td>
                        Root
                    </td>

                    <td>
                        ${
                            huffmanTree.char === " "
                                ? "Space"
                                : huffmanTree.char
                        }
                    </td>

                    <td>
                        Character found
                    </td>

                </tr>
            `;


            bitsTaken = "";
        }

    }

    // =========================
    // NORMAL TREE TRAVERSAL
    // =========================

    else {

        for (
            let i = 0;
            i < encodedMessage.length;
            i++
        ) {

            const bit =
                encodedMessage[i];


            step++;


            bitsTaken += bit;


            // Move through tree

            if (bit === "0") {

                current =
                    current.left;

            } else {

                current =
                    current.right;
            }


            const movement =
                bit === "0"
                    ? "Move Left"
                    : "Move Right";


            let character = "-";

            let action = "Continue";


            // Character found

            if (
                current &&
                current.char !== null
            ) {

                character =
                    current.char === " "
                        ? "Space"
                        : current.char;


                decoded +=
                    current.char;


                action =
                    "Character found";


                current =
                    huffmanTree;


                bitsTaken = "";
            }


            processHTML += `
                <tr>

                    <td>${step}</td>

                    <td>${bit}</td>

                    <td>
                        ${bitsTaken || "—"}
                    </td>

                    <td>
                        ${movement}
                    </td>

                    <td>
                        ${character}
                    </td>

                    <td>
                        ${action}
                    </td>

                </tr>
            `;
        }
    }


    processHTML += `
            </tbody>

        </table>
    `;


    document.getElementById(
        "decodeProcess"
    ).innerHTML =
        processHTML;


    document.getElementById(
        "finalMessage"
    ).textContent =
        decoded;
}