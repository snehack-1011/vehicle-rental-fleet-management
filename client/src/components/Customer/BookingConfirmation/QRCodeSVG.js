import React, { useMemo } from "react";
import { getQRCodeMatrix } from "../../../utils/qrGenerator";

const QRCodeSVG = ({ value, size = 160 }) => {
    const matrix = useMemo(() => {
        if (!value) return [];
        try {
            return getQRCodeMatrix(value);
        } catch (e) {
            console.error("Failed to generate QR matrix", e);
            return [];
        }
    }, [value]);

    if (!matrix || matrix.length === 0) {
        return null;
    }

    const count = matrix.length;
    const cellSize = size / count;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            style={{ display: "block", shapeRendering: "crispEdges" }}
        >
            <rect width={size} height={size} fill="#ffffff" />
            {matrix.map((row, r) =>
                row.map((isDark, c) => {
                    if (!isDark) return null;
                    return (
                        <rect
                            key={`${r}-${c}`}
                            x={(c * cellSize).toFixed(2)}
                            y={(r * cellSize).toFixed(2)}
                            width={cellSize.toFixed(2)}
                            height={cellSize.toFixed(2)}
                            fill="#000000"
                        />
                    );
                })
            )}
        </svg>
    );
};

export default QRCodeSVG;
