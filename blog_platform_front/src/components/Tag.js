import React, { useState, useEffect } from 'react';
import {addTag, removeTag} from '../services/DataInterface';

function Tag({id, name, isSelected }) {
  const [buttonColor, setButtonColor] = useState('white');
  const [textColor, setTextColor] = useState('black');

  // Función para cambiar el color del botón
  useEffect(() => {
    if(isSelected) {
      setButtonColor('blue');
      setTextColor('white');
    }
  }, [isSelected]);

  const toggleButtonColor = () => {
    setButtonColor(prevColor => {
        if(prevColor === 'blue') {
            removeTag(id);
            return 'white';
        }
        else {
            addTag(id);
            return 'blue';
        }
    });
    setTextColor(prevColor => {
        if(prevColor === 'white') {
            return 'black';
        }
        else {
            return 'white';
        }
    });
  };

  return (
    <button
      onClick={toggleButtonColor}
      style={{ backgroundColor: buttonColor, color: textColor }}
    >
      {name}
    </button>
  );
}

export default Tag;
