import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = 'https://via.placeholder.com/400x300?text=Imagem+Indispon%C3%ADvel',
  alt,
  className,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);

  return (
    <img
      src={imgSrc}
      alt={alt || ''}
      className={className}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
};