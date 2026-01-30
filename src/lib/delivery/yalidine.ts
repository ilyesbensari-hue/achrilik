import axios from 'axios';

const YALIDINE_API_URL = process.env.YALIDINE_API_URL || 'https://api.yalidine.app/v1';
const YALIDINE_API_TOKEN = process.env.YALIDINE_API_TOKEN;

interface YalidineParcel {
  order_id: string;
  from_wilaya_name: string;
  from_commune_name: string;
  from_address: string;
  to_wilaya_name: string;
  to_commune_name: string;
  to_address: string;
  firstname: string;
  familyname: string;
  contact_phone: string;
  product_list: string;
  price: number;
  do_insurance: boolean;
  declared_value: number;
  height: number;
  width: number;
  length: number;
  weight: number;
  freeshipping: boolean;
  is_stopdesk: boolean;
}

export class YalidineService {
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    if (!YALIDINE_API_TOKEN) {
      throw new Error('YALIDINE_API_TOKEN is not configured');
    }
    this.apiToken = YALIDINE_API_TOKEN;
    this.baseUrl = YALIDINE_API_URL;
  }

  private getHeaders() {
    return {
      'Authorization': `Token ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Créer un colis
   */
  async createParcel(data: YalidineParcel) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/parcels/`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Yalidine createParcel error:', error.response?.data || error.message);
      throw new Error(`Failed to create parcel: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obtenir le tracking d'un colis
   */
  async getTracking(trackingNumber: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/parcels/${trackingNumber}/`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Yalidine getTracking error:', error.response?.data || error.message);
      throw new Error(`Failed to get tracking: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obtenir l'historique de tracking
   */
  async getTrackingHistory(trackingNumber: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/parcels/${trackingNumber}/tracking/`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Yalidine getTrackingHistory error:', error.response?.data || error.message);
      throw new Error(`Failed to get tracking history: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Annuler un colis
   */
  async cancelParcel(trackingNumber: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/parcels/${trackingNumber}/cancel/`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Yalidine cancelParcel error:', error.response?.data || error.message);
      throw new Error(`Failed to cancel parcel: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Mapper le statut Yalidine vers notre enum
   */
  mapStatus(yalidineStatus: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'PENDING',           // En attente
      1: 'PICKUP_SCHEDULED',  // Ramassage planifié
      2: 'PICKED_UP',         // Ramassé
      3: 'IN_TRANSIT',        // En transit vers le centre
      4: 'IN_TRANSIT',        // Au centre
      5: 'OUT_FOR_DELIVERY',  // En cours de livraison
      6: 'DELIVERED',         // Livré
      7: 'FAILED',            // Échec de livraison
      8: 'RETURNED',          // Retourné
      9: 'CANCELLED',         // Annulé
    };
    return statusMap[yalidineStatus] || 'PENDING';
  }
}

export const yalidineService = new YalidineService();
