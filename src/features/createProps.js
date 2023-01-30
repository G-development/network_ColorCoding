export const createProps = (layout) => {
  var net = layout.network;
  var sec = layout.second;
  var allProps = {
    /* NO NODES */
    noNodes:
      net.noNodes && net.noNodes != null && net.noNodes != ""
        ? net.noNodes
        : "No nodes found",
    /* EXPORT */
    exportBtn:
      net.exportBtn && net.exportBtn != null && net.exportBtn != ""
        ? net.exportBtn
        : false,
    exportPlaceholder:
      net.exportPlaceholder &&
      net.exportPlaceholder != null &&
      net.exportPlaceholder != ""
        ? net.exportPlaceholder
        : "Network",
    exportValue:
      net.exportValue && net.exportValue != null && net.exportValue != ""
        ? net.exportValue
        : "",
    /* TEXT */
    textColor:
      net.textColor && net.textColor != null && net.textColor != ""
        ? net.textColor
        : "black",
    textStrokeColor:
      net.textStrokeColor &&
      net.textStrokeColor != null &&
      net.textStrokeColor != ""
        ? net.textStrokeColor
        : "black",
    textStrokeWidth:
      net.textStrokeWidth &&
      net.textStrokeWidth != null &&
      net.textStrokeWidth != ""
        ? net.textStrokeWidth
        : 0,

    /* LINK */
    linkColor:
      net.linkColor && net.linkColor != null && net.linkColor != ""
        ? net.linkColor
        : "black",
    linkToHexagon:
      net.linkToHexagon && net.linkToHexagon != null && net.linkToHexagon != ""
        ? net.linkToHexagon
        : "black",
    linkToHexDashArray:
      net.linkToHexDashArray &&
      net.linkToHexDashArray != null &&
      net.linkToHexDashArray != ""
        ? net.linkToHexDashArray
        : 0,

    /* EDITED NODES */
    highlightColor:
      sec.highlightColor &&
      sec.highlightColor != null &&
      sec.highlightColor != ""
        ? sec.highlightColor
        : "yellow",

    highlightStroke:
      sec.highlightStroke &&
      sec.highlightStroke != null &&
      sec.highlightStroke != ""
        ? sec.highlightStroke
        : 1.5,

    // Circle radiust and arrow adjust
    circleRadius:
      net.circleRadius && net.circleRadius != null && net.circleRadius != ""
        ? net.circleRadius
        : 25,
    arrowAdjust:
      net.arrowAdjust && net.arrowAdjust != null && net.arrowAdjust != ""
        ? net.arrowAdjust
        : 38,

    // Hexagon navigates
    hexNavigates:
      net.hexNavigates && net.hexNavigates != null && net.hexNavigates != ""
        ? net.hexNavigates
        : false,
  };
  return allProps;
};
