import React from 'react';
import Confetti from 'react-confetti';
import {
    useWindowSize,
    useWindowWidth,
    useWindowHeight,
  } from '@react-hook/window-size';

const ConfettiMachine = (props) => {

    const {width, height} = useWindowSize()

    return(
        <Confetti id='confetti'
                width={width}
                height={height}
            />
    );

}

export default ConfettiMachine;