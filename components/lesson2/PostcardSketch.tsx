import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

import styles from "./SplittingPackets.module.scss";

export const PostcardSketch = () => {
  const canvasRef = useRef();
  const fabricRef: fabric.Canvas = useRef();

  useEffect(() => {
    if (canvasRef.current) {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
      });

      let img = new Image();
      img.src = "/tcp-ip-fundamentals/resources/dog.jpg";
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () =>
        fabricRef.current.setBackgroundImage(new fabric.Image(img), () =>
          fabricRef.current.renderAll()
        );
      fabricRef.current.setBackgroundColor("#374246");

      fabricRef.current.freeDrawingBrush.color = "#e83e8c";
      fabricRef.current.freeDrawingBrush.width = 7;
    }
  }, [canvasRef]);

  return (
    <div className={styles.postcardContainer}>
      <canvas id="postcard" ref={canvasRef} width={300} height={300} />
    </div>
  );
};

export default PostcardSketch;
