// Created by iWeb 3.0.4 local-build-20140605

setTransparentGifURL('Media/transparent.gif');function applyEffects()
{var registry=IWCreateEffectRegistry();registry.registerEffects({stroke_0:new IWStrokeParts([{rect:new IWRect(-1,1,2,310),url:'Julkaisut_Publications_files/stroke.png'},{rect:new IWRect(-1,-1,2,2),url:'Julkaisut_Publications_files/stroke_1.png'},{rect:new IWRect(1,-1,652,2),url:'Julkaisut_Publications_files/stroke_2.png'},{rect:new IWRect(653,-1,2,2),url:'Julkaisut_Publications_files/stroke_3.png'},{rect:new IWRect(653,1,2,310),url:'Julkaisut_Publications_files/stroke_4.png'},{rect:new IWRect(653,311,2,2),url:'Julkaisut_Publications_files/stroke_5.png'},{rect:new IWRect(1,311,652,2),url:'Julkaisut_Publications_files/stroke_6.png'},{rect:new IWRect(-1,311,2,2),url:'Julkaisut_Publications_files/stroke_7.png'}],new IWSize(654,312)),shadow_0:new IWShadow({blurRadius:10,offset:new IWPoint(4.2426,4.2426),color:'#000000',opacity:0.250000})});registry.applyEffects();}
function hostedOnDM()
{return false;}
function onPageLoad()
{loadMozillaCSS('Julkaisut_Publications_files/Julkaisut_PublicationsMoz.css')
adjustLineHeightIfTooBig('id1');adjustFontSizeIfTooBig('id1');adjustLineHeightIfTooBig('id2');adjustFontSizeIfTooBig('id2');Widget.onload();fixAllIEPNGs('Media/transparent.gif');IMpreload('Julkaisut_Publications_files','shapeimage_1','0');fixupIECSS3Opacity('id3');applyEffects()}
function onPageUnload()
{Widget.onunload();}
