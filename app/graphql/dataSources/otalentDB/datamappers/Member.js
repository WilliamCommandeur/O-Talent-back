import bcrypt from 'bcrypt';
import CoreDatamapper from './CoreDatamapper.js';
import 'dotenv/config';
import { isMember, isOrganization } from './utils/datamapperUtils.js';
import { generateToken } from './utils/generateToken.js';

/**
 * Represents a Member datamapper.
 * @extends CoreDatamapper
 */
class Member extends CoreDatamapper {
  tableName = 'member';

  constructor(options) {
    super(options);
    this.createAssociationMethods('Member', 'Category');
    this.createAssociationMethods('Member', 'Training');
    this.createDataLoaderWithJoin('Training', 'member_likes_training', 'member_id', 'training_id');
    this.createDataLoaderWithJoin('Category', 'member_likes_category', 'member_id', 'category_id');
  }

  /**
   * Finds members by training ID.
   * @param {number} id - The training ID.
   * @returns {Promise<Array>} - A promise that resolves to an array of members.
   */
  async findByTrainingId(id) {
    const result = await this.findByTrainingIdLoader.load(id);
    return result || [];
  }

  /**
   * Finds members by category ID.
   * @param {number} id - The category ID.
   * @returns {Promise<Array>} - A promise that resolves to an array of members.
   */
  async findByCategoryId(id) {
    const result = await this.findByCategoryIdLoader.load(id);
    return result || [];
  }

  /**
   * Authenticates a user based of the provided email and password.
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<{ token: string }}
   * A promise that resolves to an object containing the authentication token.
   * @throws {Error} - Throws an error if the credantials are invalid.
   */
  async login(email, password) {
    let token;
    const query = {
      text: 'SELECT \'member\' as type, id, email, password FROM member WHERE email = $1 UNION SELECT \'organization\' as type, id, email, password FROM organization WHERE email = $1',
      values: [email],
    };

    const response = await this.client.query(query);
    const user = response.rows[0];
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      throw new Error('Invalid credentials');
    }
    if (await isMember(email)) {
      token = generateToken('member', user.id);
    } if (await isOrganization(email)) {
      token = generateToken('organization', user.id);
    }
    return { token };
  }
}

export default Member;
