
/*========================================================================
              Tropical Cyclone Flood Model of of Cyclone Ana  (ENG, FR)
==========================================================================
 20 Jan 2022 - 25 Jan 2022     
 
 Provinces hit by the cyclone include:   
- Zambezia and Sofala province, Mozambique      
- Mahajanga provinces (mostly) -> Melaky and Boeny regions, Madagascar 
Note that Mozambique and Madagascar have different administrative systems 
========================================================================= */
/* (FRANCAIS)
 20 Jan 2022 - 25 Jan 2022     
 
Les provinces frappees par le cyclone Ana comprennent:
- les provinces de Zambezie & Sofala, Mozambique
- les regions de Boeny et Melaky comprisent dans la province de Mahajanga, Madagascar
Il est important de noter que Mozambique et Madagascar ont des systemes administratifs differents
*/




//// Setting up the boundaries and respective ROIs ////

//// (FR) Les frontieres et regions d'interets sont incluses ci-dessous

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

Map.addLayer(zambezia, {}, 'Zambezia Province');
Map.addLayer(sofala, {}, 'Sofala Province');


//// Madagascar //// 

var madagascar = country.filter(
  ee.Filter.eq('ADM0_NAME', 'Madagascar'));

var melaky = province.filter(
  ee.Filter.eq('ADM1_NAME', 'Melaky'));
  
var boeny = province.filter(
  ee.Filter.eq('ADM1_NAME', 'Boeny'));

//Map.addLayer(madagascar, {}, 'Madagascar');

Map.addLayer(melaky, {}, 'Melaky Region ');
Map.addLayer(boeny, {}, 'Boeny Region');



//// OCHA Boundaries (updated for 2018 and 2019 for Madagascar and Mozambique respectively)
//// (FR) Les Frontieres sont bases de data de OCHA et mises a jour pour 2018 a Madagascar et 2019 pour la Mozambique



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

/*
(FR) Adapte du model de UN-SPIDER 'SAR FLOOD MAPPING USING A CHANGE DETECTION APPROACH from SAR Sentinel-1 Data
Dans ce script, SAR Sentinel-1 est utilisé pour générer une carte d'étendue des inondations. 
Une approche de détection de changement a été choisie, avec une comparaison entre une image d'événement avant et après les inondations. 
L'imagerie Sentinel-1 GRD est utilisée. Les étapes de prétraitement GRD comprennent l'élimination du bruit thermique, l'étalonnage radiométrique,
la correction orthorectification terrain, par conséquent, seul le filtre optionnel de speckle doit être appliqué dans le prétraitement.
*/


/*-------------------------------------------------------------------------------------------------
                            SET TIME FRAME

   Setting start and end dates of a period BEFORE the flood. 
   
   Note that Sentinel-1 has an exact repetition rate of 6 days . 
   Here we set it 18 days before as there were too many cloudy data for only 12 days before
   and 12 days after to get multiple repeats.
   
   (FR) Définition des dates de début et de fin d'une période AVANT l'inondation. 
   Notez que Sentinel-1 a un taux de répétition exact de 6 jours. Ici, nous le fixons à 18 jours avant 
   car il y avait trop de données nuageuses pour seulement 12 jours avant et 12 jours après pour obtenir plusieurs répétitions.
   */


var before_start= '2022-01-02';
var before_end='2022-01-20';

// Now set the same parameters for AFTER the flood. 
// (FR) Maintenant de la meme maniere les parametre sont definis pour apres les inondations

var after_start='2022-01-25';
//var after_end='2022-02-05';
var after_end = '2022-02-10';

/*-------------------------------------------------------------------------------------------------------
                           SET Sentinel-1 SAR PARAMETERS */

var polarization = "VH"; /*or 'VV' --> VH mostly is the prefered polarization for flood mapping.
                           However, it always depends on your study area, you can select 'VV' 
                           as well.
                           
                           (FR) ou 'VV' -> VH est la polarisation de preference pour les inondations, 
                           cependant cela est dependent des zones de choix, VV peut aussi etre choisi
                           */ 
var pass_direction = "DESCENDING"; /* or 'ASCENDING'when images are being compared use only one 
                           pass direction. Consider changing this parameter, if your image 
                           collection is empty. In some areas more Ascending images exist  
                           than descending or the other way around.
                           
                          (FR) Ou 'Ascending' pour ascendant, quand les images vont etre comparees il est preferable de choisir une direction
                          De temps en temps cela depend de l'offre d'image dans la region
                           
                           */
var difference_threshold = 1.20; /*threshold to be applied on the difference image (after flood
                           - before flood). It has been chosen by trial and error. In case your
                           flood extent result shows many false-positive or negative signals, 
                           consider changing it! 
                           
                           (FR)Seuil à appliquer sur l'image de différence (après l'inondation - avant l'inondation). 
                           Il a été choisi par essais et erreurs. Si votre résultat d'étendue d'inondation montre de nombreux signaux faux positifs ou faux négatifs,
                           envisagez de le modifier !
                           */
//var relative_orbit = 79; 
                          /*if you know the relative orbit for your study area, you can filter
                           you image collection here, to avoid errors caused by comparing
                           different relative orbits this is commented out.
                          
                          (FR) Si on a connaissance des orbites relatifs a la region, on peut filter la collection d'images ici
                          pour eviter des erreurs de comparaisons
                           */




//------------------------------- DATA SELECTION & PREPROCESSING --------------------------//

/// NB: Here the aoi is only applied to one location 
/// (FR) Ici la region d'interet (aoi) est appliqee a une seule localisation et un pays precedemment defini dans le FAO GAUL dataset


// Renaming the geometry inputs to area of interest aoi

var aoi = ee.FeatureCollection(mozambique);

  

// Load and filter Sentinel-1 GRD data using predefined parameters 
// (FR) Calcul et filtration des donnees Sentinel-1 GRD avec parametre definis
var collection= ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.eq('instrumentMode','IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', polarization))
  .filter(ee.Filter.eq('orbitProperties_pass',pass_direction)) 
  .filter(ee.Filter.eq('resolution_meters',10))
  //.filter(ee.Filter.eq('relativeOrbitNumber_start',relative_orbit ))
  .filterBounds(aoi)
  .select(polarization);
  
// Select images by predefined dates
//(FR) Selection des dates predefinies
var before_collection = collection.filterDate(before_start, before_end);
var after_collection = collection.filterDate(after_start,after_end);

// Print selected tiles to the console
// (FR) Impression des donnees 

      // Extract date from meta data
      //(FR)Extraction des donnes a partir des metadonnees
      function dates(imgcol){
        var range = imgcol.reduceColumns(ee.Reducer.minMax(), ["system:time_start"]);
        var printed = ee.String('from ')
          .cat(ee.Date(range.get('min')).format('YYYY-MM-dd'))
          .cat(' to ')
          .cat(ee.Date(range.get('max')).format('YYYY-MM-dd'));
        return printed;
      }
      // print dates of before images to console
      // (FR) Impression des images avant leur nombres dans la console
      var before_count = before_collection.size();
      print(ee.String('Tiles selected: Before Flood ').cat('(').cat(before_count).cat(')'),
        dates(before_collection), before_collection);
      
      // print dates of after images to console
      // (FR) Impression des images apres leur nombres dans la console
      var after_count = before_collection.size();
      print(ee.String('Tiles selected: After Flood ').cat('(').cat(after_count).cat(')'),
        dates(after_collection), after_collection);

// Create a mosaic of selected tiles and clip to study area
// (FR) Creation de mosaique d'images et attachement a la region d'interet
var before = before_collection.mosaic().clip(aoi);
var after = after_collection.mosaic().clip(aoi);



/* Using the following start and end dates:

16 days for before period, 12 days for after period

var before_start= '2022-01-02';
var before_end='2022-01-20';

 Now set the same parameters for AFTER the flood.
var after_start='2022-01-25';
var after_end='2022-02-05';

We get:
- Sentinel 1A - SAR GRD: 15 tiles before 
- Sentinel 1A - SAR GRD: 10 tiles after

This gives you an assemblage of 10 overlapping tiles before & 10 overlapping tiles after

--- (FR)---
En utilisant les dates de début et de fin suivantes :

16 jours pour la période avant, 12 jours pour la période après

var before_start= '2022-01-02';
var before_end='2022-01-20';

Maintenant, définissez les mêmes paramètres POUR APRÈS l'inondation.
var after_start='2022-01-25';
var after_end='2022-02-05';

Nous obtenons :

Sentinel 1A - SAR GRD : 15 tuiles avant
Sentinel 1A - SAR GRD : 10 tuiles après
Cela vous donne un assemblage de 10 tuiles se chevauchant avant et 10 tuiles se chevauchant après.

*/


// Speckle filter: granular noise,  due to the interference of waves reflected from elementary scatterers. 
// Speckle in SAR images complicates  image interpretation problem by reducing the effectiveness of image segmentation and classification
// Apply reduce the radar speckle by smoothing with radius of 50
var smoothing_radius = 50;
var before_filtered = before.focal_mean(smoothing_radius, 'circle', 'meters');
var after_filtered = after.focal_mean(smoothing_radius, 'circle', 'meters');


//------------------------------- FLOOD EXTENT CALCULATION -------------------------------//




// Calculate the difference between the before and after images
// (FR)Calcul de difference avant apres inondations
var difference = after_filtered.divide(before_filtered);

// Apply the predefined difference-threshold and create the flood extent mask 
// (FR)Application du seuil predefini et creation du masque inondation
var threshold = difference_threshold;
var difference_binary = difference.gt(threshold);


// Refine flood result using additional datasets
// (FR)Resultat de la carte et affinage avec plusieurs datasets

      
      // Include JRC layer on surface water seasonality to mask flood pixels from areas
      // of permanent water (where there is water > 10 months of the year)
      // Note that JRC data is from 2021
      
      // (FR)Couche JRC sur la saisonalite de l'eau de surface afin de masquer les zones en permanence inondees (plus de 10 mois par an ici)
      // Notez que cela date de 2021
      
      var swater = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('seasonality');
      var swater_mask = swater.gte(10).updateMask(swater.gte(10));
      
      //Flooded layer where perennial water bodies (water > 10 mo/yr) is assigned a 0 value
      // (FR) On leur assigne une valeur de 0
      var flooded_mask = difference_binary.where(swater_mask,0);
      // final flooded area without pixels in perennial waterbodies
      //(FR)Model d'inondations masques
      var flooded = flooded_mask.updateMask(flooded_mask);
      
      // Compute connectivity of pixels to eliminate those connected to 8 or fewer neighbours
      // This operation reduces noise of the flood extent product 
      // here used 8 pixels initiallly
      //(FR) Connectivite des pixels elimines pour ceux connectes a 8 ou moins de voisins , ici 8
      var connections = flooded.connectedPixelCount();    
      var flooded = flooded.updateMask(connections.gte(8));
      
      // Mask out areas with more than 5 percent slope using a Digital Elevation Model, HydroSHEDS is derived from the NASA SRTM mission
     //(FR) Les zones avec pente de plus de 5% sont masquees avec DEM HydroSHEDS (apres SRTM NASA)
      var DEM = ee.Image('WWF/HydroSHEDS/03VFDEM');
      var terrain = ee.Algorithms.Terrain(DEM);
      var slope = terrain.select('slope');
      var flooded = flooded.updateMask(slope.lt(5));

//============== Calculate flood extent area =====================//
//(FR) Calcul des zones d'inondations et leur entendue


///------ Zambezia, Mozambique -----------///
// Create a raster layer containing the area information of each pixel 
// Couche raster avec les infos par pixel
var flood_pixelarea = flooded.select(polarization)
  .multiply(ee.Image.pixelArea());

// Sum the areas of flooded pixels in Zambezia 
// default is set to 'bestEffort: true' in order to reduce compuation time, for a more 
// accurate result set bestEffort to false and increase 'maxPixels'. 
// Les zones inondees sont ajoutees, default = besteffort pour reduire le temps de computation
// peut etre modifie a maxPixels

var flood_stats_zambezia = flood_pixelarea.reduceRegion({
  reducer: ee.Reducer.sum(),              
  geometry: zambezia,
  scale: 10, // native resolution 
  //maxPixels: 1e9,
  bestEffort: true
  });

// Convert the flood extent to hectares (area calculations are originally given in meters)  
//(FR) Conversion en hectares - a l'origine en metres
var flood_area_ha_zambezia = flood_stats_zambezia
  .getNumber(polarization)
  .divide(10000)
  .round(); 


print('Area(ha) Flooded Zambezia : ', ee.Number(flood_area_ha_zambezia));  


///------- Sofala, Mozambique -------- ///

var flood_stats_sofala = flood_pixelarea.reduceRegion({
  reducer: ee.Reducer.sum(),              
  geometry: sofala,
  scale: 10, // native resolution 
  //maxPixels: 1e9,
  bestEffort: true
  });

// Convert the flood extent to hectares (area calculations are originally given in meters)  
var flood_area_ha_sofala = flood_stats_sofala
  .getNumber(polarization)
  .divide(10000)
  .round(); 


print('Area(ha) Flooded Sofala : ', ee.Number(flood_area_ha_sofala));  



///// ---- DISPLAY FLOOD DATA -----
//(FR) Les donnes d'inondations sont affichees

// Before and after flood SAR mosaic
// Avant apres, mosaique SAR Sentinel-1
Map.centerObject(aoi,8);
//Map.addLayer(before_filtered, {min:-25,max:0}, 'Before Flood',0);
//Map.addLayer(after_filtered, {min:-25,max:0}, 'After Flood',1);

// Difference layer
// (FR) Couche de difference
Map.addLayer(difference,{min:0,max:2},"Difference Layer",0);

// Radar Sentinel 1 Data CLipped to region
// (FR) Donnees radar appliquees a la region
var zambezia_radar_before = before_filtered.clip(zambezia);
var zambezia_radar_after = after_filtered.clip(zambezia);

var sofala_radar_before = before_filtered.clip(sofala);
var sofala_radar_after = after_filtered.clip(sofala);

//ocha boundaries test
// (FR) test optionel avec les frontieres de OCHA

var zambezia_radar_before_ocha =before_filtered.clip(ocha_zambezia);
var zambezia_radar_after_ocha = after_filtered.clip(ocha_zambezia);

var sofala_radar_before_ocha = before_filtered.clip(ocha_sofala);
var sofala_radar_after_ocha = after_filtered.clip(ocha_sofala);




/// Flood data clipped to region
// (FR) Application des donnes des inondations aux regions

var zambezia_flood = flooded.clip(zambezia);
var sofala_flood=flooded.clip(sofala);


// DISPLAY//
// AFFICHAGE


// NB: Unlike Madagascar's OCHA layers from 2018, the OCHA Mozambique layers cut mangrove forest areas
// Therefore we stick to FAO GAUL province layers for Mozambique's regions of interest
// (FR) A l'inverse des OCHA layers a Madagascar, en Mozambique cette base de donnees coupe les mangrove cotieres
// par defaut les donnees FAO GAUL sont utilisees


Map.addLayer(zambezia_radar_before, {min:-25,max:0}, 'Radar Before Flood Zambezia ',0);
Map.addLayer(zambezia_radar_after, {min:-25,max:0}, 'Radar After Flood Zambezia ',1);


Map.addLayer(sofala_radar_before, {min:-25,max:0}, 'Radar Before Flood Sofala',0);
Map.addLayer(sofala_radar_after, {min:-25,max:0}, 'Radar After Flood Sofala ',1);



// Flooded areas Clipped
Map.addLayer(flooded.clip(zambezia),{palette:"0000FF"},'Flooded areas Zambezia');
Map.addLayer(flooded.clip(sofala),{palette:"0000FF"},'Flooded areas Sofala');

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

var flood_area_ha = ee.Number(flood_area_ha_sofala);


// Estimated flood extent 
var text2 = ui.Label('Estimated flood extent Sofala province:',textVis);
var text2_2 = ui.Label('Please wait...',subTextVis);
dates(after_collection).evaluate(function(val){text2_2.setValue('based on Sentinel-1 imagery '+val)});
var number2 = ui.Label('Please wait...',numberVIS); 
flood_area_ha.evaluate(function(val){number2.setValue(val+' hectares')}),numberVIS;


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
  image: zambezia_flood,
  description: 'zambezia-flood-toDrive',
  scale: 10,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});

Export.image.toDrive({
  image: sofala_flood,
  description: 'sofala-flood-toDrive',
  scale: 10,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});

 //Export the image to an Earth Engine asset.
Export.image.toAsset({
  image: sofala_flood,
  description: 'exporting-sofala-flood-map-to-Assest',
  assetId: 'ee-irp-emschoenm-floodsofala',
  scale: 10,

  pyramidingPolicy: {
    '.default': 'sample',
  },
  maxPixels: 1e13
});


 //Export the image to an Earth Engine asset.
Export.image.toAsset({
  image: zambezia_flood,
  description: 'exporting-zambezia-flood-map-to-Assest',
  assetId: 'ee-irp-emschoenm-floodzambezia',
  scale: 10,

  pyramidingPolicy: {
    '.default': 'sample',
  },
  maxPixels: 1e13
});

// Export the base layer Sentinel 1 to Drive: radar after


Export.image.toDrive({
  image: zambezia_radar_after,
  description: 'zambezia-s1radar-after-toDrive',
  scale: 10,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: sofala_radar_after,
  description: 'sofala-s1radar-after-toDrive',
  scale: 10,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e13
});





