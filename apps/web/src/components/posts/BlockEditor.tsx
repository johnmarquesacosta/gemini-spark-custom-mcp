import React from 'react';
import { Trash2, ArrowUp, ArrowDown, Type, Image as ImageIcon, BarChart2 } from 'lucide-react';

export type BlockType = 'TEXT' | 'IMAGE' | 'GRAPH';

export interface PostBlockData {
  id?: string; // from API
  tempId?: string; // for local mapping
  type: BlockType;
  textContent?: string;
  imagePrompt?: string;
  graphEngine?: 'MERMAID' | 'CHART';
  graphSpec?: string;
  order: number;
  
  // Existing data if loaded from API
  renderedGraph?: {
    id: string;
    status: string;
    assetUrl?: string;
    errorMessage?: string;
  };
  generatedImage?: {
    id: string;
    status: string;
    assetUrl?: string;
    errorMessage?: string;
    prompt?: string;
  };
}

interface BlockEditorProps {
  blocks: PostBlockData[];
  onChange: (blocks: PostBlockData[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const updateBlock = (index: number, updates: Partial<PostBlockData>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    onChange(newBlocks);
  };

  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    // Re-assign order
    newBlocks.forEach((b, i) => (b.order = i));
    onChange(newBlocks);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[swapIndex];
    newBlocks[swapIndex] = temp;
    
    // Re-assign order
    newBlocks.forEach((b, i) => (b.order = i));
    onChange(newBlocks);
  };

  const addBlock = (type: BlockType) => {
    const newBlock: PostBlockData = {
      tempId: Math.random().toString(36).substring(2, 9),
      type,
      order: blocks.length,
      textContent: type === 'TEXT' ? '' : undefined,
      imagePrompt: type === 'IMAGE' ? '' : undefined,
      graphEngine: type === 'GRAPH' ? 'MERMAID' : undefined,
      graphSpec: type === 'GRAPH' ? '' : undefined,
    };
    onChange([...blocks, newBlock]);
  };

  return (
    <div className="space-y-6">
      {blocks.length === 0 && (
        <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
          No content blocks yet. Add a text, image, or graph block below.
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.tempId || block.id} className="relative group bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors">
          {/* Block Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
              {block.type === 'TEXT' && <><Type size={14} /> Text Block</>}
              {block.type === 'IMAGE' && <><ImageIcon size={14} /> Image Block {index === 0 && <span className="text-blue-500 ml-2">(Featured)</span>}</>}
              {block.type === 'GRAPH' && <><BarChart2 size={14} /> Graph Block</>}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                <ArrowUp size={16} />
              </button>
              <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                <ArrowDown size={16} />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button type="button" onClick={() => removeBlock(index)} className="p-1 text-red-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Block Content */}
          <div className="p-4">
            {block.type === 'TEXT' && (
              <textarea
                value={block.textContent || ''}
                onChange={(e) => updateBlock(index, { textContent: e.target.value })}
                placeholder="Write your content here..."
                rows={5}
                className="w-full text-gray-800 placeholder:text-gray-300 focus:outline-none bg-transparent resize-y"
              />
            )}

            {block.type === 'IMAGE' && (
              <div className="space-y-4">
                {block.generatedImage?.assetUrl && (
                  <div className="rounded overflow-hidden bg-gray-100 border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={block.generatedImage.assetUrl} alt="Generated asset" className="w-full h-auto object-contain max-h-96" />
                  </div>
                )}
                
                {block.generatedImage?.status === 'FAILED' && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded">
                    Generation Failed: {block.generatedImage.errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Image Prompt</label>
                  <textarea
                    value={block.imagePrompt || ''}
                    onChange={(e) => updateBlock(index, { imagePrompt: e.target.value })}
                    placeholder="Describe the image you want to generate..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent text-sm bg-white"
                  />
                </div>
              </div>
            )}

            {block.type === 'GRAPH' && (
              <div className="space-y-4">
                {block.renderedGraph?.assetUrl && (
                  <div className="rounded overflow-hidden bg-gray-100 border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={block.renderedGraph.assetUrl} alt="Generated graph" className="w-full h-auto object-contain max-h-96" />
                  </div>
                )}

                {block.renderedGraph?.status === 'FAILED' && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded">
                    Rendering Failed: {block.renderedGraph.errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Engine</label>
                  <select
                    value={block.graphEngine || 'MERMAID'}
                    onChange={(e) => updateBlock(index, { graphEngine: e.target.value as 'MERMAID' | 'CHART' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent text-sm bg-white mb-4"
                  >
                    <option value="MERMAID">Mermaid Diagram</option>
                    <option value="CHART">Chart.js</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Graph Spec / Code</label>
                  <textarea
                    value={block.graphSpec || ''}
                    onChange={(e) => updateBlock(index, { graphSpec: e.target.value })}
                    placeholder="Enter Mermaid syntax or Chart.js JSON config..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent text-sm font-mono bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Block Toolbar */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => addBlock('TEXT')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-ink hover:bg-gray-100 px-3 py-2 rounded transition-colors"
        >
          <Type size={16} /> Add Text
        </button>
        <button
          type="button"
          onClick={() => addBlock('IMAGE')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-ink hover:bg-gray-100 px-3 py-2 rounded transition-colors"
        >
          <ImageIcon size={16} /> Add Image
        </button>
        <button
          type="button"
          onClick={() => addBlock('GRAPH')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-ink hover:bg-gray-100 px-3 py-2 rounded transition-colors"
        >
          <BarChart2 size={16} /> Add Graph
        </button>
      </div>
    </div>
  );
}
