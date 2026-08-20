import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import './SankeyChart.css';

export function SankeyNode() {
  return null; // Configuration / Marker component
}

export function SankeyLink() {
  return null; // Configuration / Marker component
}

export function SankeyTooltip() {
  return null; // Configuration / Marker component
}

export function SankeyChart({
  data,
  animationDuration = 1100,
  animationEasing = "cubic-bezier(0.85, 0, 0.15, 1)",
  nodePadding = 12,
  nodeWidth = 16,
  height = 320,
  children
}) {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, content: null });

  // Extract link config from children if provided
  const linkConfig = useMemo(() => {
    let strokeOpacity = 0.4;
    React.Children.forEach(children, (child) => {
      if (child && child.type === SankeyLink && child.props.strokeOpacity !== undefined) {
        strokeOpacity = child.props.strokeOpacity;
      }
    });
    return { strokeOpacity };
  }, [children]);

  // Compute Layout
  const layout = useMemo(() => {
    if (!data || !data.nodes || !data.links || data.nodes.length === 0) {
      return { nodes: [], links: [] };
    }

    const svgWidth = 860;
    const svgHeight = height;
    const paddingX = 80;
    const paddingY = 24;
    const innerWidth = svgWidth - paddingX * 2;
    const innerHeight = svgHeight - paddingY * 2;

    // Normalize node map
    const nodeMap = new Map();
    data.nodes.forEach((n, i) => {
      const id = typeof n === 'string' ? n : n.name || `node-${i}`;
      nodeMap.set(id, {
        id,
        name: typeof n === 'string' ? n : n.name || id,
        color: n.color || '#0F6E6E',
        index: i,
        sourceLinks: [],
        targetLinks: [],
        value: 0
      });
    });

    const links = data.links.map((l, i) => {
      const sourceId = typeof l.source === 'number' ? data.nodes[l.source]?.name || l.source : l.source;
      const targetId = typeof l.target === 'number' ? data.nodes[l.target]?.name || l.target : l.target;
      const sourceNode = nodeMap.get(sourceId) || { name: sourceId, color: '#0F6E6E' };
      const targetNode = nodeMap.get(targetId) || { name: targetId, color: '#D06A4E' };
      return {
        id: `link-${i}`,
        source: sourceNode,
        target: targetNode,
        value: l.value || 1,
        color: l.color
      };
    });

    // Calculate node in/out degrees for columns/layers
    const inDegree = new Map();
    data.nodes.forEach((n) => inDegree.set(typeof n === 'string' ? n : n.name, 0));
    links.forEach((l) => {
      inDegree.set(l.target.name, (inDegree.get(l.target.name) || 0) + 1);
    });

    // Assign layers (0 to maxLayer)
    const layers = new Map();
    data.nodes.forEach((n) => {
      const name = typeof n === 'string' ? n : n.name;
      if ((inDegree.get(name) || 0) === 0) {
        layers.set(name, 0);
      }
    });

    // Multi-pass layer resolution
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 10) {
      changed = false;
      iterations++;
      links.forEach((l) => {
        const srcLayer = layers.get(l.source.name) ?? 0;
        const tgtLayer = layers.get(l.target.name) ?? 0;
        if (tgtLayer <= srcLayer) {
          layers.set(l.target.name, srcLayer + 1);
          changed = true;
        }
      });
    }

    const maxLayer = Math.max(...Array.from(layers.values()), 1);

    // Group nodes by layer
    const layerColumns = [];
    for (let i = 0; i <= maxLayer; i++) {
      layerColumns.push([]);
    }

    nodeMap.forEach((node) => {
      const layer = layers.get(node.name) || 0;
      layerColumns[Math.min(layer, maxLayer)].push(node);
    });

    // Compute values for nodes based on links
    links.forEach((l) => {
      l.source.value = (l.source.value || 0) + l.value;
      l.target.value = (l.target.value || 0) + l.value;
    });

    // Calculate node coordinates
    const layoutNodes = [];
    layerColumns.forEach((colNodes, colIndex) => {
      const colX = paddingX + (colIndex / maxLayer) * innerWidth;
      const totalColValue = colNodes.reduce((sum, n) => sum + Math.max(n.value, 1), 0);
      const totalPadding = (colNodes.length - 1) * nodePadding;
      const availableHeight = Math.max(innerHeight - totalPadding, 40);

      let currentY = paddingY;
      colNodes.forEach((node) => {
        const nodeHeight = Math.max(
          ((Math.max(node.value, 1) / totalColValue) * availableHeight),
          20
        );
        node.x = colX;
        node.y = currentY;
        node.width = nodeWidth;
        node.height = nodeHeight;
        node.colIndex = colIndex;
        currentY += nodeHeight + nodePadding;
        layoutNodes.push(node);
      });
    });

    // Calculate link paths (Bezier curve ribbons)
    const nodeSourceOffset = new Map();
    const nodeTargetOffset = new Map();

    const layoutLinks = links.map((link) => {
      const source = link.source;
      const target = link.target;

      const sourceOffset = nodeSourceOffset.get(source.name) || 0;
      const targetOffset = nodeTargetOffset.get(target.name) || 0;

      const sourceTotal = Math.max(source.value, 1);
      const targetTotal = Math.max(target.value, 1);

      const linkHeightSource = (link.value / sourceTotal) * source.height;
      const linkHeightTarget = (link.value / targetTotal) * target.height;

      const y0 = source.y + sourceOffset;
      const y1 = target.y + targetOffset;
      const x0 = source.x + source.width;
      const x1 = target.x;

      nodeSourceOffset.set(source.name, sourceOffset + linkHeightSource);
      nodeTargetOffset.set(target.name, targetOffset + linkHeightTarget);

      // Curved SVG Path
      const xi = (x0 + x1) / 2;
      const path = `
        M ${x0} ${y0}
        C ${xi} ${y0}, ${xi} ${y1}, ${x1} ${y1}
        L ${x1} ${y1 + linkHeightTarget}
        C ${xi} ${y1 + linkHeightTarget}, ${xi} ${y0 + linkHeightSource}, ${x0} ${y0 + linkHeightSource}
        Z
      `;

      return {
        ...link,
        path,
        x0,
        x1,
        y0,
        y1,
        sourceColor: source.color,
        targetColor: target.color
      };
    });

    return { nodes: layoutNodes, links: layoutLinks, svgWidth, svgHeight };
  }, [data, height, nodePadding, nodeWidth]);

  return (
    <div className="bklit-sankey-container">
      <svg
        viewBox={`0 0 ${layout.svgWidth || 860} ${layout.svgHeight || 320}`}
        className="bklit-sankey-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {layout.links.map((link, idx) => (
            <linearGradient
              key={`grad-${idx}`}
              id={`sankey-grad-${idx}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={link.sourceColor} stopOpacity={linkConfig.strokeOpacity + 0.25} />
              <stop offset="100%" stopColor={link.targetColor} stopOpacity={linkConfig.strokeOpacity} />
            </linearGradient>
          ))}
        </defs>

        {/* ── Links (Ribbons) ─────────────────────────── */}
        <g className="bklit-sankey-links">
          {layout.links.map((link, idx) => {
            const isHovered = hoveredLink === link.id;
            const isDimmed =
              (hoveredLink && !isHovered) ||
              (hoveredNode && hoveredNode !== link.source.name && hoveredNode !== link.target.name);

            return (
              <motion.path
                key={link.id}
                d={link.path}
                fill={`url(#sankey-grad-${idx})`}
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{
                  opacity: isDimmed ? 0.15 : isHovered ? 0.85 : linkConfig.strokeOpacity,
                  pathLength: 1
                }}
                transition={{ duration: animationDuration / 1000, ease: [0.85, 0, 0.15, 1] }}
                className="bklit-sankey-link"
                onMouseEnter={(e) => {
                  setHoveredLink(link.id);
                  setTooltipPos({
                    x: (link.x0 + link.x1) / 2,
                    y: (link.y0 + link.y1) / 2,
                    visible: true,
                    content: `${link.source.name} → ${link.target.name}: ${link.value.toLocaleString()} quotes`
                  });
                }}
                onMouseLeave={() => {
                  setHoveredLink(null);
                  setTooltipPos({ ...tooltipPos, visible: false });
                }}
              />
            );
          })}
        </g>

        {/* ── Nodes ──────────────────────────────────── */}
        <g className="bklit-sankey-nodes">
          {layout.nodes.map((node) => {
            const isHovered = hoveredNode === node.name;
            const isConnected =
              hoveredLink &&
              (layout.links.find((l) => l.id === hoveredLink)?.source.name === node.name ||
                layout.links.find((l) => l.id === hoveredLink)?.target.name === node.name);

            return (
              <g
                key={node.name}
                className="bklit-sankey-node-group"
                onMouseEnter={() => {
                  setHoveredNode(node.name);
                  setTooltipPos({
                    x: node.x + node.width / 2,
                    y: node.y,
                    visible: true,
                    content: `${node.name}: ${Math.round(node.value).toLocaleString()} volume`
                  });
                }}
                onMouseLeave={() => {
                  setHoveredNode(null);
                  setTooltipPos({ ...tooltipPos, visible: false });
                }}
              >
                {/* Node Box */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={4}
                  fill={node.color}
                  className="bklit-sankey-node-rect"
                  style={{
                    filter: isHovered || isConnected ? 'drop-shadow(0 0 8px rgba(15,110,110,0.6))' : 'none'
                  }}
                />

                {/* Node Label */}
                <text
                  x={node.colIndex === 0 ? node.x - 8 : node.x + node.width + 8}
                  y={node.y + node.height / 2 + 4}
                  textAnchor={node.colIndex === 0 ? 'end' : 'start'}
                  className="bklit-sankey-node-text"
                >
                  {node.name} ({Math.round(node.value).toLocaleString()})
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Tooltip */}
      {tooltipPos.visible && tooltipPos.content && (
        <div
          className="bklit-sankey-tooltip"
          style={{
            left: `${(tooltipPos.x / (layout.svgWidth || 860)) * 100}%`,
            top: `${(tooltipPos.y / (layout.svgHeight || 320)) * 100}%`
          }}
        >
          {tooltipPos.content}
        </div>
      )}
    </div>
  );
}

export default SankeyChart;
