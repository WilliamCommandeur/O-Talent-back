import { RESTDataSource } from '@apollo/datasource-rest';
import Debug from 'debug';
import 'dotenv/config';

const debug = Debug('app:sireneAPI');

/**
 * A class representing the Sirene API data source.
 * @extends RESTDataSource
 */
class SireneAPI extends RESTDataSource {
  baseURL = 'https://api.insee.fr/entreprises/sirene/V3/siret/';

  constructor(options) {
    super(options);
    this.token = `Bearer ${process.env.INSEE_API_KEY}`;
  }

  willSendRequest(_path, request) {
    request.headers.authorization = this.token;
  }

  /**
   * Retrieves information for a given SIRET number.
   * @param {string} id - The SIRET number to retrieve information for.
   * @returns {Promise<Object>} An object containing the retrieved information.
   */
  async getSiret(id) {
    try {
      const response = await this.get(id);
      const {
        denominationUniteLegale,
      } = response.etablissement.uniteLegale;
      const {
        libelleVoieEtablissement,
        codePostalEtablissement,
        libelleCommuneEtablissement,
        numeroVoieEtablissement,
        typeVoieEtablissement,
      } = response.etablissement.adresseEtablissement;
      const address = numeroVoieEtablissement
        ? `${numeroVoieEtablissement} ${typeVoieEtablissement} ${libelleVoieEtablissement}`
        : `${typeVoieEtablissement} ${libelleVoieEtablissement}`;

      return {
        siretFound: true,
        denominationUniteLegale,
        address,
        codePostalEtablissement,
        libelleCommuneEtablissement,
      };
    } catch (error) {
      debug(error);
      return {
        siretFound: false,
        denominationUniteLegale: 'N/A',
        libelleVoieEtablissement: 'N/A',
        codePostalEtablissement: 'N/A',
        libelleCommuneEtablissement: 'N/A',
      };
    }
  }
}
export default SireneAPI;
