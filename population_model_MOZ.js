
///=========================== POPULATION DENSITY ===================///
/// Mapping population density to estimate population affected by the TS ////
/// `this dataset estimates the number of people per km2//
//// Dataset preprocessed on QGIS and imported from World Population Hub EPSG:4326///
/// Resolution is 1km: therefore the flood layer needs to be reprojected to the resolution and projection of the population dataset
/// From 10m to 1km 
/// Requires the MOZ_pop asset which is a tiled populationd density data from World Population Hub

// .projection () Returns a Projection with the given base coordinate system and the given transform between projected coordinates and the base

// get World Pop projection
var WPprojection = MOZ_pop.projection();


// Reproject flood layer to World Pop Hub scale
var flooded_res1 = flooded
    .reproject({
    crs: WPprojection
  });

// Create a raster showing exposed population only using the resampled flood layer
// This raster now has a spatial res of 1km

var population_exposed = MOZ_pop
  .updateMask(flooded_res1)
  .updateMask(MOZ_pop);

//Sum pixel values of exposed population raster in Sofala province, geometry can be changed to roi
var stats_pp_sofala = population_exposed.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: sofala,
  scale: 1000,
  maxPixels:1e9 
});

//Sum pixel values of exposed population raster in Zambezia province
var stats_pp_zambezia = population_exposed.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: zambezia,
  scale: 1000,
  maxPixels:1e9 
});


// get number of exposed people in Sofala as integer
// b1 is the number of people per km2
var sofala_number_pp_exposed = stats_pp_sofala.getNumber('b1').round();

// get number of exposed people in Sofala as integer
var zambezia_number_pp_exposed = stats_pp_zambezia.getNumber('b1').round();


print('Area(ha) Population Exposed Sofala : ', ee.Number(sofala_number_pp_exposed));  
print('Area(ha) Population Exposed Zambezia', ee.Number(zambezia_number_pp_exposed));


// DISPLAY

// viridis palette

var palette =['482173',// (purple)
              '4682b4',//(light navy blue)
              '1eba90',//(light green)
              '170b63',//(dark blue)
              'bddf26'//(yellow)
            
];



// Population Density
var populationCountVis = {
  min: 0.02,
  max: 1000.0,
  palette: palette,
};


Map.addLayer(MOZ_pop,populationCountVis,'Mozambique Pop density 1km');


// Exposed Population, check max values and tweak them
var populationExposedVis = {
  min: 0,
  max: 10000.0,
  palette: ['yellow', 'orange', 'red'],
};
Map.addLayer(population_exposed.clip(sofala), populationExposedVis, 'Sofala Exposed Population ');
Map.addLayer(population_exposed.clip(zambezia), populationExposedVis, 'Zambezia Exposed Population');


