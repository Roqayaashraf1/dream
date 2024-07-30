import axios from "axios";
export const getExchangeRate = async (currency) => {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/KWD');
    return response.data.rates[currency];
  };