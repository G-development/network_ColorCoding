import * as d3 from "d3";
import forceBoundary from "d3-force-boundary";
import { createProps } from "../features/createProps";
import { createSVGElem, downloadSVG } from "../features/usefulMethods";
import { linkArc, drag, appendMarker } from "../features/network";

import tippy, { roundArrow } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/svg-arrow.css";

import "./style.scss";
var qlik = window.require("qlik");

export default function paint($element, layout) {
  console.log("Layout", layout);

  const allProps = createProps(layout);

  // Manage data
  var mat = layout.qHyperCube.qDataPages[0].qMatrix,
    matSecond = layout.second.qHyperCube.qDataPages[0].qMatrix;

  var nodesRaw = mat.map((item) => {
    return {
      id: item[0].qText,
      color: "", //item[0].qAttrExps.qValues[0].qText,
      highlight: "",
      name: item[0].qAttrExps.qValues[0].qText,
      type: item[0].qAttrExps.qValues[1].qText,
      navSheet: item[0].qAttrExps.qValues[2].qText,
      navSel: item[0].qAttrExps.qValues[3].qText,
      navClear: item[0].qAttrExps.qValues[4].qText,
    };
  });

  var linksRaw = matSecond
    .map((item) => {
      return {
        source: item[0].qText,
        target: item[1].qText,
        sourceColor: item[2].qText,
        targetColor: item[3].qText,
        editedSRC: item[4]?.qText,
        editedTRG: item[5]?.qText,
        highlightArrow: item[6]?.qText,
      };
    })
    .filter((item) => item.target != "-" && item.source != "-");

  // console.log("linksRaw", linksRaw);

  var filteredIds = [];
  linksRaw.forEach((link) => {
    filteredIds.push(link.source, link.target);
  });
  filteredIds = [...new Set(filteredIds)];
  // console.log("filteredIds", filteredIds);

  var nodesWColors = nodesRaw.filter((item) => filteredIds.includes(item.id));

  nodesWColors.forEach((item) => {
    for (const link of linksRaw) {
      if (link.source == item.id) {
        item.color = link.sourceColor;
        item.highlight = link?.editedSRC;
        break;
      } else if (link.target == item.id) {
        item.color = link.targetColor;
        item.highlight = link?.editedTRG;
        item.highlightArrow = link?.highlightArrow;
        break;
      }
    }
  });

  // console.log("nodesWColors", nodesWColors);

  const data = {
    nodes: nodesWColors, //nodesRaw.filter((item) => filteredIds.includes(item.id)),
    links: linksRaw,
  };

  // Initial stuff
  const elementId = "network_" + layout.qInfo.qId,
    containerWidth = $element.width(),
    containerHeight = $element.height();

  $("#" + elementId).empty();

  // If data is populated, draw svg, else append text
  if (nodesWColors.length && linksRaw.length) {
    var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
      width = containerWidth - margin.left - margin.right,
      height = containerHeight - margin.top - margin.bottom;

    // Create svg
    var svg = createSVGElem(
      elementId,
      width,
      height,
      margin,
      allProps.circleRadius
    );

    const links = data.links.map((d) => Object.create(d));
    const nodes = data.nodes.map((d) => Object.create(d));
    const types = Array.from(new Set(links.map((d) => d.type)));
    const defaultArrowColor = "#000000";
    const defs = svg.append("svg:defs");

    // Let's list the force we wanna apply on the network
    const simulation = d3
      .forceSimulation(nodes) // Force algorithm is applied to data.nodes
      .force(
        "link",
        d3
          .forceLink(links) // This force provides links between nodes
          .id((d) => d.id)
      )
      .force("charge", d3.forceManyBody().strength(-1500)); //.distanceMax([width])); // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    // .force("center", d3.forceCenter(width / 2, height / 2)); // This force attracts nodes to the center of the svg area
    // .force("x", d3.forceX())
    // .force("y", d3.forceY())
    // .on("end", ticked);

    simulation.force(
      "boundary",
      forceBoundary(
        -width / 2 + parseInt(allProps.circleRadius),
        -height / 2 + parseInt(allProps.circleRadius),
        width / 2 - parseInt(allProps.circleRadius),
        height / 2 - parseInt(allProps.circleRadius)
      )
    );

    simulation.on("tick", () => {
      // console.log("tick");
      link.attr("d", linkArc);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Initialize links
    const link = svg
      .append("g")
      .attr("id", "links")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke-dasharray", (d) =>
        d.target.type == "hexagon" ? allProps.linkToHexDashArray : ""
      )

      // This is surely a working part
      // .attr("stroke", (d) =>
      //   d.target.type == "hexagon" ? allProps.linkToHexagon : allProps.linkColor
      // )

      // Just in case this below gives problem take the part on top
      .attr("stroke", (d) =>
        d.target.type == "hexagon"
          ? allProps.linkToHexagon
          : d.highlightArrow == "true"
          ? allProps.highlightColor
          : "black"
      )
      // .attr("marker-end", (d) =>
      //   d.target.type === "circle"
      //     ? `url(${new URL(`#arrow-${d.type}`, location)})`
      //     : ""
      // );
      .attr("marker-end", (d) =>
        d.highlightArrow == "true"
          ? appendMarker(defs, allProps.highlightColor, allProps.arrowAdjust)
          : $("marker" + defaultArrowColor).length
          ? "url(" + defaultArrowColor + ")"
          : appendMarker(defs, defaultArrowColor, allProps.arrowAdjust)
      );

    // Initialize nodes
    const node = svg
      .append("g")
      .attr("id", "nodeContainer")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation));

    // Circle
    node
      .filter((d) => d.type === "circle")
      .append("circle")
      .attr("class", "circle")
      .attr("stroke", (d) =>
        d.highlight === "true" ? allProps.highlightColor : "white"
      )
      .attr("stroke-width", allProps.highlightStroke)
      .attr("r", allProps.circleRadius)
      .attr("fill", (d) => d.color);

    // Hexagons
    node
      .filter((d) => d.type === "hexagon")
      .append("path")
      .attr("class", "hexagon")
      .style("fill", (d) => d.color)
      .attr("stroke", (d) =>
        d.highlight === "true" ? allProps.highlightColor : "white"
      )
      .attr("stroke-width", allProps.highlightStroke)
      .attr(
        "d",
        `M25,0L12.5,21.650635094610966L-12.5,21.650635094610966L-25,0L-12.5,-21.650635094610966L12.5,-21.650635094610966 Z`
      );

    // Text
    node
      .append("text")
      .attr("class", (d) => (d.type == "circle" ? "circle-text" : ""))
      .attr("x", 0)
      .attr("y", "0.31em")
      .attr("font-family", "Source Sans Pro, sans-serif")
      .attr("text-anchor", "middle")
      .attr("stroke", allProps.textStrokeColor)
      .attr("stroke-width", allProps.textStrokeWidth)
      .attr("fill", allProps.textColor)
      .text((d) => d.name);
    // .clone(true)
    // .lower()
    // .attr("fill", "none")
    // .attr("stroke", "white")
    // .attr("stroke-width", 2);

    // Navigation on click
    node.on("click", (e, d) => {
      //dblclick
      // console.log(d);
      var sheetNav = {
        sheetID: d.navSheet,
        sheetSel: d.navSel,
        sheetClear: d.navClear,
      };
      if (
        (d.type == "hexagon" && allProps.hexNavigates) ||
        d.type == "circle"
      ) {
        if (sheetNav?.sheetID || sheetNav?.sheetSel || sheetNav?.sheetClear) {
          qlik.fun.promiseNavigationHistory(
            sheetNav.sheetClear,
            sheetNav.sheetSel,
            sheetNav.sheetID,
            false
          );
        }
      }
    });

    // Export SVG
    if (allProps.exportBtn) {
      $("#" + elementId).append(
        `
      <div class="export" 
        style="bottom: 5px; right: 5px ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      </div>`
      );

      // Tippy.js
      var entity = document.querySelector("#" + elementId + " .export");

      let idExportBtn = elementId + "_ExportBtn";
      var contentTippy = `
      <div>
        <h2> Save as </h2>
        <input type="text" id="svgName" placeholder=${allProps.exportPlaceholder} value=${allProps.exportValue}>
        <button id=${idExportBtn}> Export </button>
      </div>
      `;

      const instance = tippy(entity, {
        content: contentTippy,
        theme: "network",
        trigger: "manual",
        placement: "top",
        arrow: roundArrow,
        allowHTML: true,
        interactive: true,
        appendTo: document.body,
      });

      entity.addEventListener("click", (event) => {
        event.preventDefault();
        instance.show();
        document
          .querySelector("#" + idExportBtn)
          .addEventListener("click", (event) => {
            event.preventDefault();
            let name =
              $("#svgName").val() != ""
                ? $("#svgName").val()
                : allProps.exportPlaceholder;
            downloadSVG(elementId, name);
          });
      });
    }
  } else {
    $("#" + elementId).css({
      width: containerWidth,
      height: containerHeight,
      display: "flex",
      "justify-content": "center",
      "align-items": "center",
    });
    $("#" + elementId).html(
      "<h1 style='display: inline'>" + allProps.noNodes + "</h1>"
    );
  }
}
