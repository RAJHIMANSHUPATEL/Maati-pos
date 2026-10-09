import axios from "axios";
import SITE_CONFIG from "../../controller";

export const fetchProductsByCid = async (cid,store="") => {
  
  // Make API call to fetch products by category ID
  try {
    const response = await axios.post(
      `${SITE_CONFIG.apiIP}/product/getProductbyCategoryandStore`,
      {
        store: store,
        category: cid,
      },
      {
        headers: {
          Authorization: `Bearer ${SITE_CONFIG.apiToken}`,
        },
      }
    );
    if (!response.data.success) {
      throw new Error("Failed to fetch Products");
    }
    return response.data.products;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};
