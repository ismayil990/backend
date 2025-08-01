const gsmarena = require('gsmarena-api');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchSamsungModels() {
  try {
    const brands = await gsmarena.catalog.getBrands();

    const samsungBrand = brands.find(b => b.name.toLowerCase() === "samsung");
    if (!samsungBrand) {
      console.log("Samsung brendi tapılmadı.");
      return;
    }

    console.log(`Samsung brand id: ${samsungBrand.id}`);

    // Gecikmə (2 saniyə)
    await delay(2000);

    const devices = await gsmarena.catalog.getBrand(samsungBrand.id);
    console.log("Samsung modelləri:", devices);
  } catch (error) {
    console.error("Xəta baş verdi:", error.message || error);
  }
}

fetchSamsungModels();
