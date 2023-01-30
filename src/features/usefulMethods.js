import * as d3 from "d3";

export const createSVGElem = (
  elementId,
  width,
  height,
  margin,
  radiusTolerance
) => {
  var extSvg = d3
    .select("#" + elementId)
    .append("svg")
    .attr("viewBox", [
      (-width + parseInt(radiusTolerance) / 2) / 2,
      (-height + parseInt(radiusTolerance) / 2) / 2,
      width - parseInt(radiusTolerance) / 2 + margin.left + margin.right,
      height - parseInt(radiusTolerance) / 2 + margin.top + margin.bottom,
    ]);

  var svg = extSvg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("class", "network")
    .attr("id", "g_" + elementId);

  return svg;
};

export const downloadSVG = (elementId, name) => {
  //get svg element.
  var svgDownload = $("#" + elementId + " svg")[0];

  //get svg source.
  var serializer = new XMLSerializer();
  var source = serializer.serializeToString(svgDownload);

  //add name spaces.
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(
      /^<svg/,
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
    );
  }

  //add xml declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

  //convert svg source to URI data scheme
  var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

  var downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = `${name}.svg`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};
