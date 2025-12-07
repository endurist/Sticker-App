import React, { useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import { motion } from 'framer-motion';
import useImage from 'use-image';

// Sub-component for individual draggable images
const DraggableSticker = ({
  shapeRef,
  src,
  x,
  y,
  rotation = 0,
  scaleX = 1,
  scaleY = 1,
  isSelected,
  onSelect,
  onChange
}) => {
  const [image] = useImage(src);


  return (
    <KonvaImage
      ref={shapeRef}
      image={image}
      x={x}
      y={y}
      rotation={rotation}
      scaleX={scaleX}
      scaleY={scaleY}
      draggable
      width={150}
      height={150}
      offsetX={75} // Center the drag point
      offsetY={75}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
          rotation: e.target.rotation(),
          scaleX: e.target.scaleX(),
          scaleY: e.target.scaleY(),
        });
      }}
      onTransform={(e) => {
        // Update state continuously during transformation
        const node = shapeRef.current;
        const newAttrs = {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        };
        onChange(newAttrs);
      }}
      onTransformEnd={(e) => {
        // Final update when transformation ends
        const node = shapeRef.current;
        const newAttrs = {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        };
        onChange(newAttrs);
      }}
    />
  );
};

const StickerCanvas = ({ stickers, onStickersChange, transferring }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth - 40);
  const transformerRef = useRef();
  const stickerRefs = useRef([]);
  const containerRef = useRef();

  // Update canvas width when window resizes
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.offsetWidth - 40);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Initialize refs array
  React.useEffect(() => {
    stickerRefs.current = stickerRefs.current.slice(0, stickers.length);
  }, [stickers.length]);

  const handleSelect = (index) => {
    // If selecting the same sticker, deselect it
    // If selecting a different sticker, select the new one
    const newSelectedId = selectedId === index ? null : index;
    setSelectedId(newSelectedId);
  };

  const handleDeselect = (e) => {
    // deselect when clicked on empty area
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  const handleStickerChange = (index, newAttrs) => {
    const updatedStickers = stickers.map((sticker, i) =>
      i === index ? { ...sticker, ...newAttrs } : sticker
    );
    onStickersChange(updatedStickers);
  };

  // Update transformer when selected sticker changes
  React.useEffect(() => {
    if (transformerRef.current) {
      transformerRef.current.detach(); // Always detach first

      if (selectedId !== null && stickerRefs.current[selectedId]) {
        transformerRef.current.attachTo(stickerRefs.current[selectedId]);
      }

      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  const saveSticker = (sticker, index) => {
    const link = document.createElement('a');
    link.download = `sticker-${index + 1}.png`;
    link.href = sticker.url;
    link.click();
  };

  const saveCollection = () => {
    const stage = document.querySelector('.konva-stage canvas');
    if (stage) {
      const link = document.createElement('a');
      link.download = 'sticker-collection.png';
      link.href = stage.toDataURL();
      link.click();
    }
  };

  return (
    <div className="canvas-wrapper" ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>
          Your Sticker Collection
          {transferring && (
            <span style={{
              marginLeft: '10px',
              color: '#28a745',
              fontSize: '0.8em',
              animation: 'pulse 1s infinite'
            }}>
              ✨ Adding new sticker...
            </span>
          )}
        </h3>
        <div>
          {selectedId !== null && (
            <button
              onClick={() => saveSticker(stickers[selectedId], selectedId)}
              style={{
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              💾 Save Selected
            </button>
          )}
          <button
            onClick={saveCollection}
            style={{
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            💾 Save Collection
          </button>
        </div>
      </div>
      <Stage
        width={canvasWidth}
        height={500}
        className="konva-stage"
        onClick={handleDeselect}
        onTap={handleDeselect}
      >
        <Layer>
          {stickers.map((sticker, i) => (
            <DraggableSticker
              key={i}
              shapeRef={el => (stickerRefs.current[i] = el)}
              src={sticker.url}
              x={sticker.x}
              y={sticker.y}
              rotation={sticker.rotation || 0}
              scaleX={sticker.scaleX || 1}
              scaleY={sticker.scaleY || 1}
              isSelected={selectedId === i}
              onSelect={() => handleSelect(i)}
              onChange={(newAttrs) => handleStickerChange(i, newAttrs)}
            />
          ))}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 50 || newBox.height < 50) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
      <p style={{textAlign:'center', color: '#666'}}>
        Click stickers to select, drag to move, use corner handles to resize & rotate!
        {selectedId !== null && " Selected sticker can now be transformed."}
      </p>
    </div>
  );
};

export default StickerCanvas;