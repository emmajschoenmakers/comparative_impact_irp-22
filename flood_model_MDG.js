
/*========================================================================
              Tropical Cyclone Flood Model of of Cyclone Ana  
==========================================================================
 20 Jan 2022 - 25 Jan 2022                       
 Provinces hit by the cyclone include include:   
- Zambezia and Sofala province, Mozambique      
- Mahajanga provinces (mostly) -> Melaky and Boeny regions, Madagascar 
Note that Mozambique and Madagascar have different administrative systems 
========================================================================= */


//// Setting up the boundaries and respective ROIs ////

var country = ee.FeatureCollection("FAO/GAUL/2015/level0");

var province = ee.FeatureCollection("FAO/GAUL/2015/level1");

var gaul = ee.FeatureCollection("FAO/GAUL/2015/level2");

//// Mozambique ////

var mozambique = country.filter(
  ee.Filter.eq('ADM0_NAME', 'Mozambique'));

var zambezia = province.filter(
  ee.Filter.eq('ADM1_NAME', 'Zambezia'));
  
var sofala = province.filter(
  ee.Filter.eq('ADM1_NAME', 'Sofala'));


//Map.addLayer(mozambique, {}, 'Mozambique');

//Map.addLayer(zambezia, {}, 'Zambezia Province');
//Map.addLayer(sofala, {}, 'Sofala Province');


//// Madagascar //// 

var madagascar = country.filter(
  ee.Filter.eq('ADM0_NAME', 'Madagascar'));

var melaky = province.filter(
  ee.Filter.eq('ADM1_NAME', 'Melaky'));
  
var boeny = province.filter(
  ee.Filter.eq('ADM1_NAME', 'Boeny'));

Map.addLayer(madagascar, {}, 'Madagascar');

Map.addLayer(melaky, {}, 'Melaky Region ');
Map.addLayer(boeny, {}, 'Boeny Region');



//// OCHA Boundaries (updated for 2018 and 2019 for Madagascar and Mozambique respectively)


/////=========== OCHA Boundaries (2018) =========//////

var ocha_melaky = MDG_boundary.filter(
  ee.Filter.eq('ADM1_EN', 'Melaky'));
  
var ocha_boeny = MDG_boundary.filter(
  ee.Filter.eq('ADM1_EN', 'Boeny'));

var ocha_sofala = MOZ_boundary.filter(
  ee.Filter.eq('ADM1_PT','Sofala'));

var ocha_zambezia = MOZ_boundary.filter(
  ee.Filter.eq('ADM1_PT','Zambezia'));
  




/*===================================== FLOOD MODEL ===================================================


Adapted from UN-SPIDER SAR-FLOOD MAPPING USING A CHANGE DETECTION APPROACH from SAR Sentinel-1 Data

Within this script SAR Sentinel-1 is being used to generate a flood extent map. A change 
  detection approach was chosen, with a before- and after-flood event image will be compared. 
  Sentinel-1 GRD imagery is being used. GRD Pre-processing steps: 
  Thermal-Noise Removal, Radiometric calibration, Orthorectification Terrain-correction, 
  hence only the optional Speckle filter needs to be applied in the preprocessing.  
  
*/


/*-------------------------------------------------------------------------------------------------
                            SET TIME FRAME

   Setting start and end dates of a period BEFORE the flood. 
   
   Note that Sentinel-1 has an exact repitition rate of 6 days . 
   Here we set it 18 days before as there were too many cloudy data for only 12 days before
   and 12 days after to get multiple repeats.
   */

// here the Boeny region was missing one tile -
// Also note that the Batsirai TC started on the 4th of February, so to avoid a biased flood model we chose an early stopping of the after flood param to end of Jan 2022
// Although Batsirai only affected the South so results may have been altered only in the Melaky province
// So this differs from the Mozambique flood model which had 18 days before and after roughly
// Here this is 18 days before BUT 8 days after

var before_start= '2022-01-02';
var before_end='2022-01-20';

// Now set the same parameters for AFTER the flood.
var after_start='2022-01-20';
//var after_end='2022-02-05';
var after_end = '2022-02-02';

/*-------------------------------------------------------------------------------------------------------
                           SET Sentinel-1 SAR PARAMETERS */

var polarization = "VH"; /*or 'VV' --> VH mostly is the prefered polarization for flood mapping.
                           */ 
var pass_direction = "DESCENDING"; /* */
var difference_threshold = 1.20; /*threshold to be applied on the difference image (after flood
                           - before flood). It has been chosen by trial and error. In case your
                           flood extent result shows many false-positive or negative signals, 
                           can be changed! */
//var relative_orbit = 79; 
                          /*if you know the relative orbit for your study area, you can filter
                           you image collection by it here, to avoid errors caused by comparing
                           different relative orbits.*/




//------------------------------- DATA SELECTION & PREPROCESSING --------------------------//

/// NB: Here the aoi is only applied to one country 


// Renaming the geometry inputs to area of interest aoi
var aoi = ee.FeatureCollection(madagascar);

  

// Load and filter Sentinel-1 GRD data using predefined parameters 
var collection= ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.eq('instrumentMode','IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', polarization))
  .filter(ee.Filter.eq('orbitProperties_pass',pass_direction)) 
  .filter(ee.Filter.eq('resolution_meters',10))
  //.filter(ee.Filter.eq('relativeOrbitNumber_start',relative_orbit ))
  .filterBounds(aoi)
  .select(polarization);
  
// Select images by predefined dates
var before_collection = collection.filterDate(before_start, before_end);
var after_collection = collection.filterDate(after_start,after_end);

// Print selected tiles to the console

      // Extract date from meta data
      function dates(imgcol){
        var range = imgcol.reduceColumns(ee.Reducer.minMax(), ["system:time_start"]);
        var printed = ee.String('from ')
          .cat(ee.Date(range.get('min')).format('YYYY-MM-dd'))
          .cat(' to ')
          .cat(ee.Date(range.get('max')).format('YYYY-MM-dd'));
        return printed;
      }
      // print dates of before images to console
      var before_count = before_collection.size();
      print(ee.String('Tiles selected: Before Flood ').cat('(').cat(before_count).cat(')'),
        dates(before_collection), before_collection);
      
      // print dates of after images to console
      var after_count = before_collection.size();
      print(ee.String('Tiles selected: After Flood ').cat('(').cat(after_count).cat(')'),
        dates(after_collection), after_collection);

// Create a mosaic of selected tiles and clip to study area
var before = before_collection.mosaic().clip(aoi);
var after = after_collection.mosaic().clip(aoi);

//Map.addLayer(before,{min:-25,max:0}, 'Radar Before Flood before test ',0);

// Create a mosaic of selected tiles and clip to study area




/* Using the following start and end dates:

18 days for before period, 12 days for after period

var before_start= '2022-01-02';
var before_end='2022-01-20';

// Now set the same parameters for AFTER the flood.
var after_start='2022-01-22';
var after_end = '2022-02-01';

We get:
- Sentinel 1A - SAR GRD: 39 tiles before 
- Sentinel 1A - SAR GRD: 39 tiles after



*/


// Speckle filter: granular noise,  due to the interference of waves reflected from elementary scatterers. 
// Speckle in SAR images complicates  image interpretation problem by reducing the effectiveness of image segmentation and classification
// Apply reduce the radar speckle by smoothing with radius of 50
var smoothing_radius = 50;
var before_filtered = before.focal_mean(smoothing_radius, 'circle', 'meters');
var after_filtered = after.focal_mean(smoothing_radius, 'circle', 'meters');


//------------------------------- FLOOD EXTENT CALCULATION -------------------------------//




// Calculate the difference between the before and after images
var difference = after_filtered.divide(before_filtered);

// Apply the predefined difference-threshold and create the flood extent mask 
var threshold = difference_threshold;
var difference_binary = difference.gt(threshold);


// Refine flood result using additional datasets

      
      // Include JRC layer on surface water seasonality to mask flood pixels from areas
      // of permanent water (where there is water > 10 months of the year)
      // Note that JRC data is from 2021
      
      var swater = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('seasonality');
      var swater_mask = swater.gte(10).updateMask(swater.gte(10));
      
      //Flooded layer where perennial water bodies (water > 10 mo/yr) is assigned a 0 value
      var flooded_mask = difference_binary.where(swater_mask,0);
      // final flooded area without pixels in perennial waterbodies
      var flooded = flooded_mask.updateMask(flooded_mask);
      
      // Compute connectivity of pixels to eliminate those connected to 8 or fewer neighbours
      // This operation reduces noise of the flood extent product 
      // here used 8 pixels initiallly, trial and error for others but found 8 to be the best number
      var connections = flooded.connectedPixelCount();    
      var flooded = flooded.updateMask(connections.gte(8));
      
      // Mask out areas with more than 5 percent slope using a Digital Elevation Model, HydroSHEDS is derived from the NASA SRTM mission
      var DEM = ee.Image('WWF/HydroSHEDS/03VFDEM');
      var terrain = ee.Algorithms.Terrain(DEM);
      var slope = terrain.select('slope');
      var flooded = flooded.updateMask(slope.lt(5));

//============== Calculate flood extent area =====================//



///------ Melaky, Madagascar -----------///
// Create a raster layer containing the area information of each pixel 
var flood_pixelarea = flooded.select(polarization)
  .multiply(ee.Image.pixelArea());

// Sum the areas of flooded pixels in Melaky 
// default is set to 'bestEffort: true' in order to reduce compuation time, for a more 
// accurate result set bestEffort to false and increase 'maxPixels'. 
var flood_stats_melaky = flood_pixelarea.reduceRegion({
  reducer: ee.Reducer.sum(),              
  geometry: melaky,
  scale: 10, // native resolution 
  //maxPixels: 1e9,
  bestEffort: true
  });

// Convert the flood extent to hectares (area calculations are originally given in meters)  
var flood_area_ha_melaky = flood_stats_melaky
  .getNumber(polarization)
  .divide(10000)
  .round(); 


print('Area(ha) Flooded Melaky : ', ee.Number(flood_area_ha_melaky));  


///------- Boeny, Madagascar -------- ///

var flood_stats_boeny = flood_pixelarea.reduceRegion({
  reducer: ee.Reducer.sum(),              
  geometry: boeny,
  scale: 10, // native resolution 
  //maxPixels: 1e9,
  bestEffort: true
  });

// Convert the flood extent to hectares (area calculations are originally given in meters)  
var flood_area_ha_boeny = flood_stats_boeny
  .getNumber(polarization)
  .divide(10000)
  .round(); 


print('Area(ha) Flooded Boeny : ', ee.Number(flood_area_ha_boeny));  



///// ---- DISPLAY FLOOD DATA -----

// Before and after flood SAR mosaic
Map.centerObject(aoi,8);
Map.addLayer(before_filtered, {min:-25,max:0}, 'Before Flood',0);
Map.addLayer(after_filtered, {min:-25,max:0}, 'After Flood',1);

// Difference layer
Map.addLayer(difference,{min:0,max:2},"Difference Layer",0);

// Radar Sentinel 1 Data CLipped to region
var melaky_radar_before = before_filtered.clip(melaky);
var melaky_radar_after = after_filtered.clip(melaky);

var boeny_radar_before = before_filtered.clip(boeny);
var boeny_radar_after = after_filtered.clip(boeny);



/// Flood data clipped to region

var melaky_flood = flooded.clip(melaky);
var boeny_flood=flooded.clip(boeny);


// DISPLAY//

// We stick to FAO GAUL province layers for Madagascar's regions of interest



Map.addLayer(melaky_radar_before, {min:-25,max:0}, 'Radar Before Flood Melaky ',0);
Map.addLayer(melaky_radar_after, {min:-25,max:0}, 'Radar After Flood Melaky ',1);


Map.addLayer(boeny_radar_before, {min:-25,max:0}, 'Radar Before Flood Boeny',0);
Map.addLayer(boeny_radar_after, {min:-25,max:0}, 'Radar After Flood Boeny ',1);



// Flooded areas Clipped
Map.addLayer(flooded.clip(melaky),{palette:"0000FF"},'Flooded areas Melaky');
Map.addLayer(flooded.clip(boeny),{palette:"0000FF"},'Flooded areas Boeny');

Map.addLayer(melaky_flood,{palette:"0000FF"},'Final Flooded areas Melaky');
Map.addLayer(boeny_flood,{palette:"0000FF"},'Final Flooded areas Boeny');



////// ---- Diplaying on the map ----- /////// 

//Prepare the visualtization parameters of the labels 

var results = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px',
    width: '350px'
  }
});

var textVis = {
  'margin':'0px 8px 2px 0px',
  'fontWeight':'bold'
  };
var numberVIS = {
  'margin':'0px 0px 15px 0px', 
  'color':'bf0f19',
  'fontWeight':'bold'
  };
var subTextVis = {
  'margin':'0px 0px 2px 0px',
  'fontSize':'12px',
  'color':'grey'
  };

var titleTextVis = {
  'margin':'0px 0px 15px 0px',
  'fontSize': '18px', 
  'font-weight':'', 
  'color': '3333ff'
  };



// Create lables of the results 
// Titel and time period
var title = ui.Label('Results', titleTextVis);
var text1 = ui.Label('Flood status between:',textVis);
var number1 = ui.Label(after_start.concat(" and ",after_end),numberVIS);

// Alternatively, print dates of the selected tiles
//var number1 = ui.Label('Please wait...',numberVIS); 
//(after_collection).evaluate(function(val){number1.setValue(val)}),numberVIS;

// Estimated flood extent 
var text2 = ui.Label('Estimated flood extent:',textVis);
var text2_2 = ui.Label('Please wait...',subTextVis);
dates(after_collection).evaluate(function(val){text2_2.setValue('based on Sentinel-1 imagery '+val)});
var number2 = ui.Label('Please wait...',numberVIS); 
//flood_area_ha.evaluate(function(val){number2.setValue(val+' hectares')}),numberVIS;


// var number2 = ui.Label('Please wait...',numberVIS); 

// Add the labels to the panel 
results.add(ui.Panel([
        title,
        text1,
        number1,
        text2,
        text2_2,
        number2,
        ]
      ));

// Add the panel to the map 
Map.add(results);


/// =========== EXPORTS ========== ///


Export.image.toDrive({
  image: melaky_flood,
  description: 'melaky-flood-toDrive',
  scale: 10,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: boeny_flood,
  description: 'boeny-flood-toDrive',
  scale: 10,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e13
});

 //Export the image to an Earth Engine asset.
Export.image.toAsset({
  image: melaky_flood,
  description: 'exporting-melaky-flood-map-to-Assest',
  assetId: 'ee-irp-emschoenm-flood-melaky',
  scale: 10,

  pyramidingPolicy: {
    '.default': 'sample',
  },
  maxPixels: 1e13
});


 //Export the image to an Earth Engine asset.
Export.image.toAsset({
  image: boeny_flood,
  description: 'exporting-boeny-flood-map-to-Assest',
  assetId: 'ee-irp-emschoenm-flood-boeny',
  scale: 10,

  pyramidingPolicy: {
    '.default': 'sample',
  },
  maxPixels: 1e13
});


