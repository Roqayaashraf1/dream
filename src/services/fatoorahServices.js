import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

export class FatoorahServices {
  constructor() {
    this.baseUrl = process.env.FATOORA_BASE_URL;
    this.apiKey = process.env.FATOORA_TOKEN;
   
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async buildRequest(url, method, data = {}) {
    try {
      const response = await axios({
        method: method,
        url: `${this.baseUrl}${url}`,
        headers: this.headers,
        data: data,
      });

      if (response.status !== 200) {
        return false;
      }
      return response.data;
    } catch (error) {
      console.error("Error in buildRequest:", error);
      return false;
    }
  }

  async sendPayment(data) {
    const response = await this.buildRequest("v2/SendPayment", "POST", data);
    return response;
  }

  async getPaymentStatus(data) {
    const response = await this.buildRequest(
      "v2/getPaymentStatus",
      "POST",
      data
    );
    return response;
  }

  async callAPI(endpointURL, apiKey, postFields = {}) {
    try {
      const response = await axios.post(endpointURL, postFields, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error in callAPI:", error);
      return null;
    }
  }
}