'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CropModalProps {
  src: string;
  onConfirm: (croppedDataUrl: string) => void;
  onSkip: () => void;
  onCancel: () => void;
}

interface Selection {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * 图片裁剪弹窗
 * - 拖拽框选要保留的区域（支持鼠标/触摸）
 * - 暗色遮罩 + 三分辅助线
 * - 确认后导出原图分辨率的裁剪 PNG（先铺白底，与主流程 alpha 修复一致）
 */
export default function CropModal({ src, onConfirm, onSkip, onCancel }: CropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const scaleRef = useRef<number>(1);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number }>({ active: false, startX: 0, startY: 0 });
  const [sel, setSel] = useState<Selection | null>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (sel) {
      const x = Math.min(sel.x0, sel.x1);
      const y = Math.min(sel.y0, sel.y1);
      const w = Math.abs(sel.x1 - sel.x0);
      const h = Math.abs(sel.y1 - sel.y0);
      if (w > 1 && h > 1) {
        // 选区外暗色遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.rect(x, y, w, h);
        ctx.fill('evenodd');
        // 边框
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        // 三分辅助线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 1; i <= 2; i++) {
          ctx.moveTo(x + (w * i) / 3, y);
          ctx.lineTo(x + (w * i) / 3, y + h);
          ctx.moveTo(x, y + (h * i) / 3);
          ctx.lineTo(x + w, y + (h * i) / 3);
        }
        ctx.stroke();
      }
    }
  }, [sel]);

  // 加载图片并适配画布尺寸
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const MAX_W = 560;
      const MAX_H = 420;
      const scale = Math.min(MAX_W / img.width, MAX_H / img.height, 1);
      scaleRef.current = scale;
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      setImgSize({ w: img.width, h: img.height });
      setSel(null);
      requestAnimationFrame(() => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      });
    };
    img.src = src;
  }, [src]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * (canvas.width / rect.width)));
    const y = Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * (canvas.height / rect.height)));
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getPos(e);
    dragRef.current = { active: true, startX: pos.x, startY: pos.y };
    setSel({ x0: pos.x, y0: pos.y, x1: pos.x, y1: pos.y });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active) return;
    const pos = getPos(e);
    setSel((s) => (s ? { ...s, x1: pos.x, y1: pos.y } : s));
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  // 选区对应的原图像素尺寸
  const selOrigSize = sel && imgSize
    ? {
        w: Math.round(Math.abs(sel.x1 - sel.x0) / scaleRef.current),
        h: Math.round(Math.abs(sel.y1 - sel.y0) / scaleRef.current),
      }
    : null;
  const canConfirm = !!(selOrigSize && selOrigSize.w >= 2 && selOrigSize.h >= 2);

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !sel || !canConfirm) return;
    const scale = scaleRef.current;
    let sx = Math.round(Math.min(sel.x0, sel.x1) / scale);
    let sy = Math.round(Math.min(sel.y0, sel.y1) / scale);
    let sw = Math.max(1, Math.round(Math.abs(sel.x1 - sel.x0) / scale));
    let sh = Math.max(1, Math.round(Math.abs(sel.y1 - sel.y0) / scale));
    sx = Math.max(0, Math.min(sx, img.width - 2));
    sy = Math.max(0, Math.min(sy, img.height - 2));
    sw = Math.min(sw, img.width - sx);
    sh = Math.min(sh, img.height - sy);
    if (sw < 2 || sh < 2) return;
    const out = document.createElement('canvas');
    out.width = sw;
    out.height = sh;
    const octx = out.getContext('2d');
    if (!octx) return;
    octx.fillStyle = '#FFFFFF'; // 与主流程一致：先铺白底消除 alpha 缺失
    octx.fillRect(0, 0, sw, sh);
    octx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    onConfirm(out.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">裁剪图片</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          在图上拖动鼠标框选要保留的区域；裁剪后按选区重新生成拼豆图纸。
        </p>

        <div className="flex justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-2 mb-3">
          <canvas
            ref={canvasRef}
            className="max-w-full rounded cursor-crosshair select-none"
            style={{ touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>

        <div className="flex items-center justify-between mb-4 text-xs text-gray-500 dark:text-gray-400">
          <span>
            原图：{imgSize ? `${imgSize.w}×${imgSize.h}` : '加载中…'}
          </span>
          <span className={canConfirm ? 'text-blue-600 dark:text-blue-300 font-medium' : ''}>
            {canConfirm && selOrigSize ? `选区：${selOrigSize.w}×${selOrigSize.h} px` : '未选择区域'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="flex-1 h-10 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            使用整图
          </button>
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 h-10 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            确认裁剪
          </button>
        </div>
      </div>
    </div>
  );
}
