# 🌊 Independent Research Project (IRP)



![TC image](https://github.com/emmajschoenmakers/comparative_impact_irp-22/blob/main/pictures/beira_moz_damage.webp)

*Debris and destroyed and damaged buildings in a residential neighbourhood in Beira, Mozambique, after Cyclone Idai hit in March 2019. (Photo: Guillem Sartorio / Bloomberg via Getty Images)*


----

![image](https://user-images.githubusercontent.com/91467519/187665558-d06d463c-1f82-419e-9bf4-8a4be167ebbe.png)



#### By Emma Schoenmakers (Department of Earth Science & Engineering, Imperial College London) & Supervised by Dr. Minerva Singh (CEP, Imperial College London)

*Reviewed by Dr. Adriana Paluszny (Imperial College London) and Dr Minerva Singh (Imperial College London).* 

All the work completed for my Independent Research Project in Environmental Data Science and Machine learning for partial fulfillment of the EDSML Master's degree at Imperial College London. For more information, please contact Emma Schoenmakers at ejs21@ic.ac.uk or emmajschoenmakers@outlook.com.




## Abstract 

More than 40% of the world’s urban population lives in coastal habitats and are increasingly exposed to cyclones following the rising impacts of climate change. However, there is still insufficient information available for the streamlined remotely sensed assessment of impacts of tropical cyclones on coastal habitats, particularly in the Mozambique Channel. Using Sentinel-1 and Sentinel-2 data along with socio-ecological parameters including mangrove forest health and population density, we modelled the extent of flooding and its impact following the ‘severe tropical storm’ Ana which occurred between the 20th January until 25th January over the Mozambique Channel in Madagascar and Mozambique. Focusing on regions hit by Ana, namely the Sofala and Zambezia regions and the Boeny and Melaky provinces in Mozambique and Madagascar respectively, we adapted a model by the UN-SPIDER to effectively assess storm and cyclone impacts at a resolution of up to 10m. 


## Repository Structure

- [Reports](https://github.com/emmajschoenmakers/comparative_impact_irp-22/tree/main/reports) : including presentation slides, final report and project plan.
- [Info](https://github.com/emmajschoenmakers/comparative_impact_irp-22/tree/main/info) : including admin information, IRP title, and supervisors.
- [Tools](https://github.com/emmajschoenmakers/comparative_impact_irp-22/tree/main/tools) : including testing and CI files.
- [Images](https://github.com/emmajschoenmakers/comparative_impact_irp-22/tree/main/pictures) : including high resolution output images, repo images, images and tables from the irp report, and presentation pictures.
- [Scripts](https://github.com/emmajschoenmakers/comparative_impact_irp-22/tree/main/scripts) : including graph scripts, classification and model scripts (Python, JavaScript)

## User Instructions

The majority of the code, apart from those requiring external datasets such the landcover and population impact assessment, can be run in [Google Earth Engine](https://code.earthengine.google.com/) and can be reproducible to any area of interest by changing the area of interest (aoi). This also includes immediate visualisation of storm-related flooding statistics and impact.  
Note that further data visualisation was produced in Python and QGIS and not available on GEE directly. It is up to the end-user if they wish to do so after exporting the models to Drive for example.

For optional Python data visualisation:
In the terminal, go to the file path containing the ``environment.yml`` file.
Next run the commands:
``conda env create -f environment.yml``

``pip install -r requirements.txt``

Follow the prompts given by the terminal


## Datasets 

**References:**

Copernicus Sentinel-2 (processed by ESA), 2021, MSI Level-2A BOA Reflectance Product. Collection 0. European Space Agency.

Copernicus Sentinel-1 (processed by ESA), 2021, SAR Level-2A. Collection 0. European Space Agency.

Farr, T. G. et al., 2007, The Shuttle Radar Topography Mission, Rev. Geophys., 45, RG2004, doi:10.1029/2005RG000183. (Also available online at http://www2.jpl.nasa.gov/srtm/SRTM_paper.pdf)

Jean-Francois Pekel, Andrew Cottam, Noel Gorelick, Alan S. Belward, High-resolution mapping of global surface water and its long-term changes. Nature 540, 418-422 (2016). (doi:10.1038/nature20584)

WorldPop (www.worldpop.org - School of Geography and Environmental Science, University of Southampton; Department of Geography and Geosciences, University of Louisville; Departement de Geographie, Universite de Namur) and Center for International Earth Science Information Network (CIESIN), Columbia University (2018). Global High Resolution Population Denominators Project - Funded by The Bill and Melinda Gates Foundation (OPP1134076). https://dx.doi.org/10.5258/SOTON/WP00674

Zanaga, D., Van De Kerchove, R., De Keersmaecker, W., Souverijns, N., Brockmann, C., Quast, R., Wevers, J., Grosu, A., Paccini, A., Vergnaud, S., Cartus, O., Santoro, M., Fritz, S., Georgieva, I., Lesiv, M., Carter, S., Herold, M., Li, Linlin, Tsendbazar, N.E., Ramoino, F., Arino, O., 2021. ESA WorldCover 10 m 2020 v100. https://doi.org/10.5281/zenodo.5571936

