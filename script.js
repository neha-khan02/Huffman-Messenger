/* =========================================
   HUFFMAN MESSENGER
========================================= */


let huffmanCodes = {};

let encodedMessage = "";

let huffmanTree = null;


/* =========================================
   GET CHARACTER FREQUENCY
========================================= */

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


/* =========================================
   CREATE HUFFMAN TREE
========================================= */

function createHuffmanTree(frequency) {

    let nodes = [];


    for (let char in frequency) {

        nodes.push({

            char: char,

            freq: frequency[char],

            left: null,

            right: null

        });

    }


    /* Only one unique character */

    if (nodes.length === 1) {

        return nodes[0];

    }


    /* Create tree */

    while (nodes.length > 1) {

        nodes.sort(
            (a, b) => a.freq - b.freq
        );


        const left = nodes.shift();

        const right = nodes.shift();


        const newNode = {

            char: null,

            freq:
                left.freq + right.freq,

            left: left,

            right: right

        };


        nodes.push(newNode);

    }


    return nodes[0];
}


/* =========================================
   GENERATE HUFFMAN CODES
========================================= */

function generateCodes(
    node,
    code = ""
) {

    if (!node) {

        return;

    }


    /* Leaf node */

    if (node.char !== null) {

        huffmanCodes[node.char] =
            code === "" ? "0" : code;

        return;

    }


    generateCodes(
        node.left,
        code + "0"
    );


    generateCodes(
        node.right,
        code + "1"
    );
}


/* =========================================
   ENCODE MESSAGE
========================================= */

function encode(message) {

    let result = "";


    for (let char of message) {

        result +=
            huffmanCodes[char];

    }


    return result;
}


/* =========================================
   DISPLAY FREQUENCY
========================================= */

function displayFrequency(
    frequency
) {

    const box =
        document.getElementById(
            "frequency"
        );


    if (!box) {

        return;

    }


    let html = `

        <table>

            <tr>

                <th>
                    Character
                </th>

                <th>
                    Frequency
                </th>

            </tr>

    `;


    for (let char in frequency) {

        let displayChar = char;


        if (char === " ") {

            displayChar = "Space";

        }


        html += `

            <tr>

                <td>
                    ${displayChar}
                </td>

                <td>
                    ${frequency[char]}
                </td>

            </tr>

        `;

    }


    html += `</table>`;


    box.innerHTML = html;
}


/* =========================================
   DISPLAY CODES
========================================= */

function displayCodes(
    codes,
    elementId = "codes"
) {

    const box =
        document.getElementById(
            elementId
        );


    if (!box) {

        return;

    }


    let html = `

        <table>

            <tr>

                <th>
                    Character
                </th>

                <th>
                    Code
                </th>

            </tr>

    `;


    for (let char in codes) {

        let displayChar = char;


        if (char === " ") {

            displayChar = "Space";

        }


        html += `

            <tr>

                <td>
                    ${displayChar}
                </td>

                <td>
                    <strong>
                        ${codes[char]}
                    </strong>
                </td>

            </tr>

        `;

    }


    html += `</table>`;


    box.innerHTML = html;
}


/* =========================================
   SENDER - ENCODE
========================================= */

function encodeMessage() {

    const messageBox =
        document.getElementById(
            "message"
        );


    if (!messageBox) {

        return;

    }


    const message =
        messageBox.value;


    if (message.length === 0) {

        return;

    }


    /* Frequency */

    const frequency =
        getFrequency(message);


    /* Huffman Tree */

    huffmanTree =
        createHuffmanTree(
            frequency
        );


    /* Clear previous codes */

    huffmanCodes = {};


    /* Generate codes */

    generateCodes(
        huffmanTree
    );


    /* Encode */

    encodedMessage =
        encode(message);


    /* Display */

    displayFrequency(
        frequency
    );


    displayCodes(
        huffmanCodes
    );


    document.getElementById(
        "encoded"
    ).textContent =
        encodedMessage;


    /* Draw tree */

    drawTree(
        huffmanTree
    );


    /*
        Save codes internally.

        User only sees/copies
        the binary.
    */

    localStorage.setItem(
        "huffmanCodes",
        JSON.stringify(
            huffmanCodes
        )
    );

}


/* =========================================
   COPY ONLY BINARY
========================================= */

function copyBinary() {

    if (!encodedMessage) {

        return;

    }


    navigator.clipboard.writeText(
        encodedMessage
    );

}


/* =========================================
   DRAW HUFFMAN TREE
========================================= */

function drawTree(root) {

    const svg =
        document.getElementById(
            "tree"
        );


    if (!svg || !root) {

        return;

    }


    svg.innerHTML = "";


    const leaves = [];


    /* Find leaves */

    function collectLeaves(
        node
    ) {

        if (!node) {

            return;

        }


        if (node.char !== null) {

            leaves.push(node);

            return;

        }


        collectLeaves(
            node.left
        );


        collectLeaves(
            node.right
        );

    }


    collectLeaves(root);


    const spacing = 130;


    const width =
        Math.max(
            600,
            leaves.length * spacing
        );


    const height = 350;


    svg.setAttribute(
        "width",
        width
    );


    svg.setAttribute(
        "height",
        height
    );


    const positions =
        new Map();


    /* Position nodes */

    function place(
        node,
        depth,
        minX,
        maxX
    ) {

        if (!node) {

            return;

        }


        const x =
            (minX + maxX) / 2;


        const y =
            50 + depth * 100;


        positions.set(
            node,
            {
                x: x,
                y: y
            }
        );


        place(
            node.left,
            depth + 1,
            minX,
            x
        );


        place(
            node.right,
            depth + 1,
            x,
            maxX
        );

    }


    place(
        root,
        0,
        0,
        width
    );


    /* Draw edges */

    function drawEdges(
        node
    ) {

        if (!node) {

            return;

        }


        const parent =
            positions.get(node);


        if (node.left) {

            const child =
                positions.get(
                    node.left
                );


            drawLine(
                parent,
                child,
                "0"
            );


            drawEdges(
                node.left
            );

        }


        if (node.right) {

            const child =
                positions.get(
                    node.right
                );


            drawLine(
                parent,
                child,
                "1"
            );


            drawEdges(
                node.right
            );

        }

    }


    /* Draw line */

    function drawLine(
        from,
        to,
        bit
    ) {

        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );


        line.setAttribute(
            "x1",
            from.x
        );


        line.setAttribute(
            "y1",
            from.y
        );


        line.setAttribute(
            "x2",
            to.x
        );


        line.setAttribute(
            "y2",
            to.y
        );


        line.setAttribute(
            "class",
            "tree-line"
        );


        svg.appendChild(
            line
        );


        const text =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );


        text.setAttribute(
            "x",
            (from.x + to.x) / 2
        );


        text.setAttribute(
            "y",
            (from.y + to.y) / 2
        );


        text.setAttribute(
            "class",
            "tree-bit"
        );


        text.textContent =
            bit;


        svg.appendChild(
            text
        );

    }


    drawEdges(root);


    /* Draw nodes */

    for (
        let [node, pos]
        of positions
    ) {

        const circle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );


        circle.setAttribute(
            "cx",
            pos.x
        );


        circle.setAttribute(
            "cy",
            pos.y
        );


        circle.setAttribute(
            "r",
            28
        );


        circle.setAttribute(
            "class",

            node.char === null
                ? "tree-node internal"
                : "tree-node leaf"
        );


        svg.appendChild(
            circle
        );


        const label =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );


        label.setAttribute(
            "x",
            pos.x
        );


        label.setAttribute(
            "y",
            pos.y + 5
        );


        label.setAttribute(
            "class",
            "tree-label"
        );


        if (
            node.char !== null
        ) {

            label.textContent =
                node.char === " "
                    ? "Space"
                    : node.char;

        } else {

            label.textContent =
                node.freq;

        }


        svg.appendChild(
            label
        );

    }

}


/* =========================================
   RECEIVER - RECEIVE BINARY
========================================= */

function receiveBinary() {

    const input =
        document.getElementById(
            "receivedData"
        );


    if (!input) {

        return;

    }


    const binary =
        input.value.trim();


    if (!binary) {

        return;

    }


    /* Check binary */

    if (
        !/^[01]+$/.test(binary)
    ) {

        alert(
            "Only 0 and 1 are allowed."
        );

        return;

    }


    /*
        Get Huffman codes
        saved by Sender.
    */

    const savedCodes =
        localStorage.getItem(
            "huffmanCodes"
        );


    if (!savedCodes) {

        alert(
            "Please encode a message from the Sender page first."
        );

        return;

    }


    window.receivedBinary =
        binary;


    window.receivedCodes =
        JSON.parse(
            savedCodes
        );


    /* Display binary */

    document.getElementById(
        "receivedBinary"
    ).textContent =
        binary;


    /* Display codes */

    displayCodes(
        window.receivedCodes,
        "receivedCodes"
    );

}


/* =========================================
   BUILD TREE FROM HUFFMAN CODES
========================================= */

function buildTreeFromCodes(
    codes
) {

    const root = {

        char: null,

        freq: 0,

        left: null,

        right: null

    };


    for (
        let char in codes
    ) {

        const code =
            codes[char];


        let node = root;


        for (
            let bit of code
        ) {

            if (bit === "0") {

                if (!node.left) {

                    node.left = {

                        char: null,

                        freq: 0,

                        left: null,

                        right: null

                    };

                }


                node =
                    node.left;

            } else {

                if (!node.right) {

                    node.right = {

                        char: null,

                        freq: 0,

                        left: null,

                        right: null

                    };

                }


                node =
                    node.right;

            }

        }


        node.char =
            char;

    }


    return root;
}


/* =========================================
   RECEIVER - DECODE
========================================= */

function decodeReceivedMessage() {

    if (
        !window.receivedCodes ||
        !window.receivedBinary
    ) {

        alert(
            "Please receive the binary message first."
        );

        return;

    }


    const codes =
        window.receivedCodes;


    const binary =
        window.receivedBinary;


    const root =
        buildTreeFromCodes(
            codes
        );


    let node = root;


    let decoded = "";


    let steps = `

        <table>

            <tr>

                <th>
                    Step
                </th>

                <th>
                    Bit
                </th>

                <th>
                    Character
                </th>

                <th>
                    Action
                </th>

            </tr>

    `;


    let step = 1;


    /* Decode every bit */

    for (
        let bit of binary
    ) {

        if (bit === "0") {

            node =
                node.left;

        } else {

            node =
                node.right;

        }


        /* Invalid path */

        if (!node) {

            alert(
                "Invalid binary message."
            );

            return;

        }


        let character = "-";


        let action =
            "Move through Huffman tree";


        /* Character found */

        if (
            node.char !== null
        ) {

            character =
                node.char === " "
                    ? "Space"
                    : node.char;


            decoded +=
                node.char;


            action =
                "Character decoded";


            node = root;

        }


        steps += `

            <tr>

                <td>
                    ${step}
                </td>

                <td>
                    ${bit}
                </td>

                <td>
                    ${character}
                </td>

                <td>
                    ${action}
                </td>

            </tr>

        `;


        step++;

    }


    steps += `
        </table>
    `;


    document.getElementById(
        "decodeProcess"
    ).innerHTML =
        steps;


    document.getElementById(
        "finalMessage"
    ).textContent =
        decoded;

}
