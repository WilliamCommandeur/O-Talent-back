import Debug from 'debug';
const debug = Debug('app:resolvers:member');

const member = {
  trainings({ id: categoryId }, _, { dataSources }) {
    debug(`find all trainings of category [${categoryId}]`);
    return dataSources.otalentDB.trainings.findByCategoryId(categoryId);
  },
};

export default member;