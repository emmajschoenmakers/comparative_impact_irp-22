/////==================== NDVI =============== /////
// Calculating the NDVI of mangroves, as an indicator of the degradation of mangrove classes from the LC CGLOPS dataset
/// Using before the start of the cyclone season in Mozambique Channel vs after ////
/// This is October to April in Mozambique, November to March in Madagascar
/// For ease and consistency and augmentation of data available, we choose October-April time period for both countries///

// Setting the the dates of interest: before and after cyclone season
// Taking a month before cyclone season starts and one month after cyclone season ends


// Setting parameters for BEFORE cyclone season in Mozambique Channel

var before_start= '2021-08-15';
var before_end='2021-09-30';

// Now set the same parameters for AFTER cyclone season
var after_start='2022-05-01';
//var after_end='2022-02-05';
var after_end = '2022-06-15';




// Setting regions of interest from FAO and OCHA boundaries



//// Setting up the boundaries and respective ROIs ////

var country = ee.FeatureCollection("FAO/GAUL/2015/level0")

var province = ee.FeatureCollection("FAO/GAUL/2015/level1");

var gaul = ee.FeatureCollection("FAO/GAUL/2015/level2");

//// ======Mozambique====== ////

var mozambique = country.filter(
  ee.Filter.eq('ADM0_NAME', 'Mozambique'));

var zambezia = province.filter(
  ee.Filter.eq('ADM1_NAME', 'Zambezia'));
  
var sofala = province.filter(
  ee.Filter.eq('ADM1_NAME', 'Sofala'));


//Map.addLayer(mozambique, {}, 'Mozambique');

//Map.addLayer(zambezia, {}, 'Zambezia Province');
//Map.addLayer(sofala, {}, 'Sofala Province');


////====== Madagascar =========//// 

var madagascar = country.filter(
  ee.Filter.eq('ADM0_NAME', 'Madagascar'));


/////=========== OCHA Boundaries (2018) =========//////

var melaky = MDG_boundary.filter(
  ee.Filter.eq('ADM1_EN', 'Melaky'));
  
var boeny = MDG_boundary.filter(
  ee.Filter.eq('ADM1_EN', 'Boeny'));




///// Adding Sentine-2 Data ////

var roi = madagascar;

var image = ee.ImageCollection('COPERNICUS/S2')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 2.5)) //filters to get data with less than 7% clouds
    .sort('CLOUDY_PIXEL_PERCENTAGE')
    .filterBounds(roi)
    .map(function(img){
                      var t = img.select([ 'B1','B2','B3','B4','B5','B6','B7','B8','B8A', 'B9','B10', 'B11','B12']).divide(10000);//Rescale to 0-1
                      var out = t.copyProperties(img).copyProperties(img,['system:time_start']);
                    return out;
                      })
                      .select(['B1','B2','B3','B4','B5','B6','B7','B8','B8A', 'B9','B10', 'B11','B12'],['aerosol', 'blue', 'green', 'red', 'red1','red2','red3','nir','red4','h2o', 'cirrus','swir1', 'swir2']);


// Select images by predefined dates
var before_collection = image.filterDate(before_start, before_end);
var after_collection = image.filterDate(after_start,after_end);


print('S2 images of the area during the study period BEFORE <10% Cloud cover',before_collection);// print list of all images with<10% cloud
print('S2 images of the area during the study period AFTER <10% Cloud cover',after_collection);// print list of all images with<10% cloud



// Obtain the least cloudy image and clip to the ROI: BEFORE //

var vizParams = {bands: ['red', 'green', 'blue'], min: 0, max: 0.3};

// Picking the median value in the stack. This has the benefit of removing clouds (which have a high value) and shadows (which have a low value).
// Takes the entire collection and calculates the median for every pixel 

var cloudmask_composite_before = before_collection.median();


Map.addLayer(cloudmask_composite_before.clip(roi), {bands: ['red', 'green', 'blue'], min: 0, max: 0.3}, 'Before:s2 image composite-mean');

var s2final_before = ee.Image(cloudmask_composite_before);
var s2ROI_before = s2final_before.clip(roi);


var red_before = s2ROI_before.select('red');
var nir_before = s2ROI_before.select('nir');
var ndvi_bf = nir_before.subtract(red_before).divide(nir_before.add(red_before)).rename('NDVI');

var ndviParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
Map.addLayer(ndvi_bf, ndviParams, 'NDVI BEFORE', false);

// Obtain least cloud image, clip to ROI & compute NDVI : AFTER //

var cloudmask_composite_after = after_collection.median();


Map.addLayer(cloudmask_composite_after.clip(roi), {bands: ['red', 'green', 'blue'], min: 0, max: 0.3}, 'After:s2 image composite-mean');

var s2final_after = ee.Image(cloudmask_composite_after);
var s2ROI_after = s2final_after.clip(roi);




var red_after = s2ROI_after.select('red');
var nir_after = s2ROI_after.select('nir');
var ndvi_af = nir_after.subtract(red_after).divide(nir_after.add(red_after)).rename('NDVI');

var ndviParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
Map.addLayer(ndvi_af, ndviParams, 'NDVI AFTER', false);


/// Creating an NDVI layer with difference between before and after cyclone season to look at degradation


// Calculate the difference between the before and after images
var difference = ndvi_af.divide(ndvi_bf);

// High values (bright pixels) indicate high change, low values (dark pixels) mean little change

// NDVI viz
var NDVIDiffVis = {
  min: 0,
  max: 2,
  palette: ['yellow', 'turquoise', 'purple'],
};

// Difference layer
Map.addLayer(difference,NDVIDiffVis,"Difference Layer",0);


//// ==== NDVI clipped to ROIs === //// 

var melaky_ndvi= difference.clip(melaky);
var boeny_ndvi = difference.clip(boeny);

Map.addLayer(melaky_ndvi,NDVIDiffVis,'Melaky NDVI');
Map.addLayer(boeny_ndvi,NDVIDiffVis, 'Boeny NDVI');

// Areas in yellow indicate low differences in vegetation index




///// ================= Calculating NDVIs for mangrove areas ============= ///// 



//=================== Data Viz =============== ///

// NDVI viz
var NDVIDiffVis = {
  min: 0,
  max: 2,
  palette: ['yellow', 'turquoise','purple'],
};


// Define a palette for the 11 distinct land cover classes.
var cglopsPalette = [
  
  '737070', // barren/sparse vegetation (dark grey)
  '014a0f', // tree cover (dark green)
  'f2ae30',  // shrubland (orange)
  'f2ea0c', // grassland (yellow)
  'fc97df', // croplands (pink)
  '04827c', // herbaceous wetlands (turquoise)
  'd9d9d9', // snow and ice (light gray)
  'e02514', // urban (aka built-up) (red) 9shows up as light purple
  'e8d99e', // moss and lichens (beige)
  '0775e3', // permanent water bodies (blue)
  '00ba6d',  // mangroves (light green)
];


/////// Adding land cover layers for masking: ZAMBEZIA, Mozambqiue ///////

// Specify the min and max labels and the color palette matching the labels.
Map.addLayer(lc_boeny,
             {min: 0, max: 95, palette: cglopsPalette},
             'Boeny ESA World Cover classification');
             
             


/////// SOFALA, Mozambique //////
// Specify the min and max labels and the color palette matching the labels.
Map.addLayer(lc_melaky,
             {min: 0, max: 95, palette: cglopsPalette},
             'Melaky ESA World Cover classification');
             
             


////// ======================== MANGROVE DEGRADATION ========================///////

// Taking out the mangrove class of the cglops dataset

/// Creating a Mangrove Mask //
// 95 is the max value and the code for mangrove class

var mangroveVis = {
  bands: ['b1'],
  min: 94,
  max: 95
};


var mangrove_mlk = lc_melaky;
//Map.addLayer(mangrove_zbz,mangroveVis,'mangrove class');


//// Classification: Mangrove Crop Mask: Melaky////


var mangrove_class_mlk= lc_melaky.eq(95); // Selects mangrove Band = Value of 95

var mask_discrete_mlk=mangrove_class_mlk.eq(1); /// making all crop cover fraction appear as 1 and rest of data as 0
var mask_melaky_mangrove = lc_melaky.updateMask(mask_discrete_mlk);
Map.addLayer(mask_melaky_mangrove,{},'LC mangrove Mask Melaky');

//// Classification: Mangrove Crop Mask: Boeny////


var mangrove_class_boe= lc_boeny.eq(95); // Selects mangrove Band = Value of 95

var mask_discrete_boe=mangrove_class_boe.eq(1); /// making all crop cover fraction appear as 1 and rest of data as 0
var mask_boeny_mangrove = lc_boeny.updateMask(mask_discrete_boe);
Map.addLayer(mask_boeny_mangrove,{},'LC mangrove Mask Boeny ');



// ============= Finding the degradation (NDVI) of mangrove class =============== //



/////// Boeny ///////
/// masking the mangrove layer mask with itself and seeing where it intersects with the ndvi ///
// making the image a mask
var mangroveNDVI_boeny = mask_boeny_mangrove.selfMask().multiply(boeny_ndvi.selfMask());
Map.addLayer(mangroveNDVI_boeny,NDVIDiffVis,'Boeny mangrove NDVI');



///// Melaky ///


var mangroveNDVI_melaky = mask_melaky_mangrove.selfMask().multiply(melaky_ndvi.selfMask());
Map.addLayer(mangroveNDVI_melaky,NDVIDiffVis,'Melaky mangrove ndvi');

// Note that areas of NDVI for mangroves in light purple (vs dark purple) are the areas with the most difference before/after cyclone season
// This matches with the yellow colour in the country-wide NDVI map


 //Export the image to an Earth Engine asset. Res for green, blue and red bands are 20m
Export.image.toAsset({
  image: mangroveNDVI_boeny,
  description: 'exporting-ndvi-boeny-diff-map-to-Assest',
  assetId: 'ee-irp-emschoenm-ndvi-boeny-diff-map-mozambique',
  scale: 20,

  pyramidingPolicy: {
    '.default': 'sample',
  },
  maxPixels: 1e13
});


// Note the scale has been reprojected to 20 to fit
 //Export the image to an Earth Engine asset. Res for green, blue and red bands are 20m
Export.image.toAsset({
  image: mangroveNDVI_melaky,
  description: 'exporting-ndvi-melaky-diff-map-to-Assest',
  assetId: 'ee-irp-emschoenm-ndvi-melaky-diff-map-mozambique',
  scale: 20,

  pyramidingPolicy: {
    '.default': 'sample',
  },
  maxPixels: 1e13
});


// Export to Drive //


Export.image.toDrive({
  image: mangroveNDVI_boeny,
  description: 'boeny-mangrove-ndvi-toDrive',
  scale: 20,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: mangroveNDVI_melaky,
  description: 'melaky-mangrove-ndvi-toDrive',
  scale: 20,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e13
});



/// Similar trend to Mozambique overall where at v fine scale there is more degradation in areas next to barren areas
// Less degradation at the water to mangrove edge but more at mangrove/barren areas edges ~within a mangrove patch
