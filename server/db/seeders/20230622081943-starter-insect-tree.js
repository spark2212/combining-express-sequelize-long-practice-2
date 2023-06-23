'use strict';

const seed = [
  {
    insect: {name: "Western Pygmy Blue Butterfly"},
    trees: [
      {tree: "General Sherman"},
      {tree: "General Grant"},
      {tree: "Lincoln"},
      {tree: "Stagg"}
    ]
  },
  {
    insect: {name: "Patu Digua Spider"},
    trees: [
      {tree: "Stagg"}
    ]
  }
];

const {Insect, Tree, InsectTree} = require("../models");
const {Op} = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    for (let insectNum = 0; insectNum < seed.length; insectNum++) {
      let insectData = seed[insectNum].insect;
      let thisInsect = await Insect.findOne({where: {name: insectData.name}});
      let treeData = [];

      seed[insectNum].trees.forEach(tree => {
        treeData.push(tree.tree);
      });

      let theseTrees = await Tree.findAll({
        where: {
          tree: {
            [Op.in]: treeData
          }
        }
      });

      await thisInsect.addTrees(theseTrees);

      // await thisInsect.addTrees(seed[insectNum].trees);
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    for (let insectNum = 0; insectNum < seed.length; insectNum++) {
      let insectData = seed[insectNum].insect;
      let thisInsect = await Insect.findOne({where: {name: insectData.name}});

      let treeData = [];

      seed[insectNum].trees.forEach(tree => {
        treeData.push(tree.tree);
      });

      let theseTrees = await Tree.findAll({
        where: {
          tree: {
            [Op.in]: treeData
          }
        }
      });

      await thisInsect.removeTrees(theseTrees);

      // await thisInsect.removeTrees(seed[insectNum].trees);
    }
  }
};
