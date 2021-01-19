import React from 'react';

const GameQuestion = (props) => {
    return(
        <div className="gamequestion">
            {props.question}
            <div id='answers'>
                <button className='gamebtn' onMouseUp={() => props.clickEvent(true)} type="button" disabled={props.answered} > Yes </button>
                <button className='gamebtn' onMouseUp={() => props.clickEvent(false)} type="button" disabled={props.answered} > No </button>
            </div>
        </div>
    );
}

export default GameQuestion;