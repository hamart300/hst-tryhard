import React from 'react'
import styled from 'styled-components'

const Wrapper=styled.div`
    position:relative;
    width:36px;
    height:36px;
    color:white;
    display:inline-block;
    vertical-align:top;
    text-align:right;
`

const Tex=styled.b`
    position:absolute;
    bottom:0;
    right:0;
`

function UnitIcon(props){
    return <Wrapper
        style={{
            'backgroundImage':'url("/img/'+props.unit+'.png")',
            'color':props.num>0?'white':'red'
            }}
        title={props.unit+(props.timing?" @"+props.timing:"")}>
        <Tex>{props.num?props.num:""}</Tex>

    </Wrapper>
}

export default UnitIcon