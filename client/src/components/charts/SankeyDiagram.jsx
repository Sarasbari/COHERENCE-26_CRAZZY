import { useMemo, useState, useRef, useEffect } from 'react';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { motion } from 'framer-motion';
import { DIVISIONS, DEPARTMENTS } from '../../config/constants';
import { formatCurrency } from '../../utils/formatCurrency';

export default function SankeyDiagram({ data }) {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 900, height: 500 });
    const [hoveredNode, setHoveredNode] = useState(null);
    const [hoveredLink, setHoveredLink] = useState(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            setDimensions({ width: Math.max(600, width), height: 500 });
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const sankeyData = useMemo(() => {
        if (!data || data.length === 0) return null;

        // Build nodes: State → Divisions → Departments
        const nodes = [];
        const nodeMap = {};
        let idx = 0;

        // State node
        nodeMap['maharashtra'] = idx;
        nodes.push({ name: 'Maharashtra State', id: 'maharashtra', color: '#1E3A8A' });
        idx++;

        // Division nodes
        Object.entries(DIVISIONS).forEach(([divId, div]) => {
            nodeMap[divId] = idx;
            nodes.push({ name: div.name, id: divId, color: div.color });
            idx++;
        });

        // Department nodes
        DEPARTMENTS.forEach((dept) => {
            nodeMap[dept.id] = idx;
            nodes.push({ name: dept.name, id: dept.id, color: dept.color });
            idx++;
        });

        // Build links
        const links = [];

        // State → Division links
        Object.keys(DIVISIONS).forEach((divId) => {
            const divData = data.filter((r) => r.division === divId);
            const value = divData.reduce((s, r) => s + r.allocated, 0);
            if (value > 0) {
                links.push({
                    source: nodeMap['maharashtra'],
                    target: nodeMap[divId],
                    value,
                    spent: divData.reduce((s, r) => s + r.spent, 0),
                });
            }
        });

        // Division → Department links
        Object.keys(DIVISIONS).forEach((divId) => {
            DEPARTMENTS.forEach((dept) => {
                const records = data.filter((r) => r.division === divId && r.department === dept.id);
                const value = records.reduce((s, r) => s + r.allocated, 0);
                if (value > 0) {
                    links.push({
                        source: nodeMap[divId],
                        target: nodeMap[dept.id],
                        value,
                        spent: records.reduce((s, r) => s + r.spent, 0),
                    });
                }
            });
        });

        if (links.length === 0) return null;

        // Create sankey layout
        const { width, height } = dimensions;
        const sankeyGen = sankey()
            .nodeWidth(20)
            .nodePadding(12)
            .extent([[40, 20], [width - 40, height - 20]]);

        const graph = sankeyGen({
            nodes: nodes.map((n) => ({ ...n })),
            links: links.map((l) => ({ ...l })),
        });

        return graph;
    }, [data, dimensions]);

    if (!sankeyData) {
        return (
            <div className="glass-card p-8 flex items-center justify-center h-[500px]">
                <p className="text-[#64748B]">No data available for Sankey diagram</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="glass-card p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4 px-2">
                <div>
                    <h3 className="section-title">Fund Flow Visualization</h3>
                    <p className="section-subtitle">State → Divisions → Departments allocation flow</p>
                </div>
                <div className="flex gap-4 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-[#16A34A] rounded" /> Healthy Flow</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-[#F59E0B] rounded" /> Warning</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-[#DC2626] rounded" /> Critical</span>
                </div>
            </div>

            <svg width={dimensions.width} height={dimensions.height}>
                {/* Links */}
                <g>
                    {sankeyData.links.map((link, i) => {
                        const utilization = link.value > 0 ? (link.spent / link.value) * 100 : 0;
                        const linkColor = utilization >= 70 ? 'rgba(22,163,74,0.2)' :
                            utilization >= 50 ? 'rgba(245,158,11,0.2)' :
                                'rgba(220,38,38,0.2)';
                        const isHovered = hoveredLink === i;

                        return (
                            <path
                                key={`link-${i}`}
                                d={sankeyLinkHorizontal()(link)}
                                fill="none"
                                stroke={isHovered ? (utilization >= 70 ? '#16A34A' : utilization >= 50 ? '#F59E0B' : '#DC2626') : linkColor}
                                strokeWidth={Math.max(2, link.width)}
                                strokeOpacity={isHovered ? 0.8 : hoveredLink !== null ? 0.1 : 0.4}
                                onMouseEnter={() => setHoveredLink(i)}
                                onMouseLeave={() => setHoveredLink(null)}
                                style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                            />
                        );
                    })}
                </g>

                {/* Nodes */}
                <g>
                    {sankeyData.nodes.map((node, i) => (
                        <g key={`node-${i}`}>
                            <motion.rect
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                transition={{ delay: i * 0.05 }}
                                x={node.x0}
                                y={node.y0}
                                width={node.x1 - node.x0}
                                height={Math.max(4, node.y1 - node.y0)}
                                fill={node.color || '#64748b'}
                                rx={4}
                                onMouseEnter={() => setHoveredNode(i)}
                                onMouseLeave={() => setHoveredNode(null)}
                                style={{ cursor: 'pointer', filter: hoveredNode === i ? `drop-shadow(0 0 8px ${node.color})` : 'none' }}
                            />
                            {/* Labels */}
                            {(node.x0 < dimensions.width / 2) ? (
                                <text
                                    x={node.x1 + 8}
                                    y={(node.y0 + node.y1) / 2}
                                    dy="0.35em"
                                    fontSize={11}
                                    fill="#0F172A"
                                    fontWeight={hoveredNode === i ? 600 : 400}
                                >
                                    {node.name}
                                </text>
                            ) : (
                                <text
                                    x={node.x0 - 8}
                                    y={(node.y0 + node.y1) / 2}
                                    dy="0.35em"
                                    fontSize={11}
                                    fill="#0F172A"
                                    textAnchor="end"
                                    fontWeight={hoveredNode === i ? 600 : 400}
                                >
                                    {node.name}
                                </text>
                            )}
                        </g>
                    ))}
                </g>

                {/* Tooltip for hovered link */}
                {hoveredLink !== null && sankeyData.links[hoveredLink] && (() => {
                    const link = sankeyData.links[hoveredLink];
                    const util = link.value > 0 ? ((link.spent / link.value) * 100).toFixed(1) : '0';
                    const srcName = sankeyData.nodes[link.source.index]?.name || '';
                    const tgtName = sankeyData.nodes[link.target.index]?.name || '';
                    return (
                        <g>
                            <rect x={dimensions.width / 2 - 120} y={10} width={240} height={55} rx={8} fill="rgba(255,255,255,0.97)" stroke="#E2E8F0" />
                            <text x={dimensions.width / 2} y={30} textAnchor="middle" fontSize={11} fill="#0F172A" fontWeight={600}>
                                {srcName} → {tgtName}
                            </text>
                            <text x={dimensions.width / 2} y={50} textAnchor="middle" fontSize={10} fill="#64748B">
                                Allocated: {formatCurrency(link.value)} | Utilization: {util}%
                            </text>
                        </g>
                    );
                })()}
            </svg>
        </div>
    );
}
