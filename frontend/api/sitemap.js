const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const apiUrl = process.env.VITE_API_URL || 'http://localhost:4000';
    const backendUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    
    const response = await axios.get(`${backendUrl}/sitemap.xml`);
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(response.data);
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
};
