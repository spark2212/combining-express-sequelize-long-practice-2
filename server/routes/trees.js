// Instantiate router - DO NOT MODIFY
const express = require('express');
const { Sequelize } = require('../db/models');
const router = express.Router();

/**
 * BASIC PHASE 1, Step A - Import model
 */
// Your code here
const { Tree }  = require("../db/models");

/**
 * INTERMEDIATE BONUS PHASE 1 (OPTIONAL), Step A:
 *   Import Op to perform comparison operations in WHERE clauses
 **/
// Your code here

/**
 * BASIC PHASE 1, Step B - List of all trees in the database
 *
 * Path: /
 * Protocol: GET
 * Parameters: None
 * Response: JSON array of objects
 *   - Object properties: heightFt, tree, id
 *   - Ordered by the heightFt from tallest to shortest
 */
router.get('/', async (req, res, next) => {
    let trees = [];

    // Your code here
    let unsortedTrees = await Tree.findAll();
    let treeSorter = [];

    for (let i = 0; i < unsortedTrees.length; i++) {
        let lastHeight = 0;
        let tallestJ = 0;

        for (let j = 0; j < unsortedTrees.length; j++) {
            if (!treeSorter.includes(j)) {
                if (unsortedTrees[j].heightFt > lastHeight) {
                    lastHeight = unsortedTrees[j].heightFt;
                    tallestJ = j;
                }
            }
        }

        treeSorter.push(tallestJ);
        trees.push(unsortedTrees[tallestJ]);
    }

    res.status(200);
    res.setHeader("Content-Type", "application/json");

    res.json(trees);
});

/**
 * BASIC PHASE 1, Step C - Retrieve one tree with the matching id
 *
 * Path: /:id
 * Protocol: GET
 * Parameter: id
 * Response: JSON Object
 *   - Properties: id, tree, location, heightFt, groundCircumferenceFt
 */
router.get('/:id', async (req, res, next) => {
    let tree;

    try {
        // Your code here
        let trees = await Tree.findAll();
        tree = trees[req.params.id - 1];

        if (tree) {
            res.json(tree);
        } else {
            next({
                status: "not-found",
                message: `Could not find tree ${req.params.id}`,
                details: 'Tree not found'
            });
        }
    } catch(err) {
        next({
            status: "error",
            message: `Could not find tree ${req.params.id}`,
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

/**
 * BASIC PHASE 2 - INSERT tree row into the database
 *
 * Path: /trees
 * Protocol: POST
 * Parameters: None
 * Request Body: JSON Object
 *   - Properties: name, location, height, size
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully created new tree
 *   - Property: data
 *     - Value: object (the new tree)
 */
router.post('/', async (req, res, next) => {
    try {
        let newTree = Tree.build({
            tree: req.body.name,
            location: req.body.location,
            heightFt: req.body.height,
            groundCircumferenceFt: req.body.size
        });

        await newTree.save();

        res.status(200);
        res.setHeader("Content-Type", "application/json");

        res.json({
            status: "success",
            message: "Successfully created new tree",
            data: newTree
        });
    } catch(err) {
        next({
            status: "error",
            message: 'Could not create new tree',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

/**
 * BASIC PHASE 3 - DELETE a tree row from the database
 *
 * Path: /trees/:id
 * Protocol: DELETE
 * Parameter: id
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully removed tree <id>
 * Custom Error Handling:
 *   If tree is not in database, call next() with error object
 *   - Property: status
 *     - Value: not-found
 *   - Property: message
 *     - Value: Could not remove tree <id>
 *   - Property: details
 *     - Value: Tree not found
 */
router.delete('/:id', async (req, res, next) => {
    let errorStatus = null;

    try {
        let myTree = await Tree.findByPk(req.params.id);

        if (!myTree) {
            errorStatus = "not-found";
            throw new Error("Tree not found");
        }

        myTree.destroy();
        res.status(200);
        res.setHeader("Content-Type", "application/json");

        res.json({
            status: "success",
            message: `Successfully removed tree ${req.params.id}`,
        });
    } catch(err) {
        res.status(404);
        next({
            status: errorStatus,
            message: `Could not remove tree ${req.params.id}`,
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

/**
 * INTERMEDIATE PHASE 4 - UPDATE a tree row in the database
 *   Only assign values if they are defined on the request body
 *
 * Path: /trees/:id
 * Protocol: PUT
 * Parameter: id
 * Request Body: JSON Object
 *   - Properties: id, name, location, height, size
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully updated tree
 *   - Property: data
 *     - Value: object (the updated tree)
 * Custom Error Handling 1/2:
 *   If id in request params does not match id in request body,
 *   call next() with error object
 *   - Property: status
 *     - Value: error
 *   - Property: message
 *     - Value: Could not update tree <id>
 *   - Property: details
 *     - Value: <params id> does not match <body id>
 * Custom Error Handling 2/2:
 *   If tree is not in database, call next() with error object
 *   - Property: status
 *     - Value: not-found
 *   - Property: message
 *     - Value: Could not update tree <id>
 *   - Property: details
 *     - Value: Tree not found
 */
router.put('/:id', async (req, res, next) => {
    let errorStatus = null;
    let errorMessage = null;
    let errorDetails = null;

    try {
        // Your code here
        if (req.body.id) {
            if (req.body.id != req.params.id) {
                errorStatus = "error";
                errorMessage = "Could not update tree";
                errorDetails = `${req.params.id} does not match ${req.body.id}`;
                throw new Error(errorDetails);
            }
        }

        let myTree = await Tree.findByPk(req.params.id);

        if (!myTree) {
            errorStatus = "not-found";
            errorMessage = `Could not update tree ${req.params.id}`;
            errorDetails = "Tree not found";
            throw new Error(errorDetails);
        }

        if (req.body.name) {
            myTree.tree = req.body.name;
        }
        if (req.body.location) {
            myTree.location = req.body.location;
        }
        if (req.body.height) {
            myTree.heightFt = req.body.height;
        }
        if (req.body.size) {
            myTree.groundCircumferenceFt = req.body.size;
        }

        await myTree.save();

        res.status(200);
        res.setHeader("Content-Type", "application/json");
        res.json({
            status: "success",
            message: "Successfully updated tree",
            data: myTree
        });

    } catch(err) {
        next({
            status: errorStatus,
            message: errorMessage,
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

/**
 * INTERMEDIATE BONUS PHASE 1 (OPTIONAL), Step B:
 *   List of all trees with tree name like route parameter
 *
 * Path: /search/:value
 * Protocol: GET
 * Parameters: value
 * Response: JSON array of objects
 *   - Object properties: heightFt, tree, id
 *   - Ordered by the heightFt from tallest to shortest
 */
router.get('/search/:value', async (req, res, next) => {
    let trees = [];


    res.json(trees);
});

// Export class - DO NOT MODIFY
module.exports = router;
