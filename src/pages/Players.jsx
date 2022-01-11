import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Players.css'

function formattime(time) {
    return ""+Math.floor(time/60)+":"+Math.floor(time%60/10)+Math.floor(time%10)
}

function formatp(a,b=1){
    return ""+Math.floor(a*100/b)+"%"
}

function formati(i){
    return Math.floor(i*100)/100
}

export default function Players({reps,lists,players}){
    const navigate=useNavigate()
    const [dataSet,setDataSet]=useState([])
    const [hideTips,setHideTips]=useState(false)
    const sortItBy=(id)=>{
        const nd=dataSet.sort((a,b)=>{
            if(id==="name") return a.name<b.name?-1:1
            if(id==="race") return a.race[0]<b.race[0]?-1:1
            if(id.includes("worker")) return (a[id]<b[id]?-1:1)
            return (a[id]<b[id]?1:-1)
        })
        setDataSet([...nd])
    }

    useEffect(()=>{
        const newDataSet=players.map((pl,id)=>({
            ...pl,
            id,
            winrate:pl.w/pl.count,
        }))
        setDataSet(newDataSet)
    },[players])

    return <>
    <center>
    <h1>HST Játékos statisztikák</h1>
    <h5>Beküldött replayek alapján</h5>
    <div style={{border:"1px solid",backgroundColor:"#ffffaa",display:hideTips?"none":"block",width:"90%",textAlign:"left",padding:"40px"}}       
    >
        <button style={{float:"right"}} onClick={()=>setHideTips(true)}>x</button>
        Magyarázat a táblázathoz:<br/>
        Csak a bekülödött replayek számítanak, mindenki azzal a névvel amivel játszott. Ha valaki SMURF accon játszik annak más a neve,
        akár csak pár meccs erejéig.<br/>
        Minden statisztika az átlagot mutatja, mellette az átlagot nyert meccsekre és az átlagot vesztett meccsek esetén.<br/>
        - Hatékonyság: Resources lost ellenfednek/neked. Tehát ha neked 1k mineral unit lossod volt ellenfelednek meg 3k akkor 300%. 
        Ha valakinek jobb mint 1000% a hatékonysága, akkor az tökéletes meccsnek számít, és nem számolódik bele a többi győztes 
        meccshez, hanem megjelenik a "P" oszlop alatt mint Perfect win.<br/>
        - Halott dolgozók: Hány dolgozód hal meg a játék első 7 percében átlagosan, azaz mennyire vigyázol rájuk.<br/><br/>
        Ha rendezni akarod a táblát, csak klikkelj a fejlécre az adott statisztikán.<br/>
        Ha rányomsz az emberek nevére, akkor az behívja az általa játszott replayeket + részletesebb map és winrate statokat róla.<br/>
        Jó böngészést :)


    </div>
    <table>
        <thead>
            <tr>
                <td colSpan={3} margin={10}></td>
                <td colSpan={3} margin={50}>Winrate</td>
                <td colSpan={3} margin={50}>Meccs hossz</td>
                <td colSpan={4} margin={10}>Hatékonyság</td>
                <td colSpan={3} margin={10}>Halott dolgozók</td>
            </tr>
            <tr style={{cursor:"pointer"}}>
                <td onClick={()=>sortItBy("name")}>Név</td>
                <td onClick={()=>sortItBy("race")}>Faj</td>
                <td onClick={()=>sortItBy("count")}>#</td>
                <td onClick={()=>sortItBy("winrate")}>°</td><td onClick={()=>sortItBy("w")}>W</td><td onClick={()=>sortItBy("l")}>L</td>
                <td onClick={()=>sortItBy("length")}>°</td><td onClick={()=>sortItBy("lengthw")}>W</td><td onClick={()=>sortItBy("lengthl")}>L</td>
                <td onClick={()=>sortItBy("efficiency")}>°</td><td onClick={()=>sortItBy("efficiency_perfect")}>P</td><td onClick={()=>sortItBy("efficiencyw")}>W</td><td onClick={()=>sortItBy("efficiencyl")}>L</td>
                <td onClick={()=>sortItBy("workerloss")}>°</td><td onClick={()=>sortItBy("workerlossw")}>W</td><td onClick={()=>sortItBy("workerlossl")}>L</td>
            </tr>
        </thead>
        <tbody>
            {dataSet.map((pl,count)=><tr className={count%2==1?"alter":""}>
                <td style={{cursor:"pointer"}} onClick={()=>navigate("/player/"+pl.id)}>{pl.name}</td>
                <td>{pl.race}</td>
                <td>{pl.count}</td>
                <td className="alterr">{formatp(pl.winrate)}</td><td className="alterr">{pl.w}</td><td className="alterr">{pl.l}</td>
                <td>{formattime(pl.length)}</td><td>{pl.w?formattime(pl.lengthw):""}</td><td>{pl.l?formattime(pl.lengthl):""}</td>
                <td className="alterr">{formatp(pl.efficiency)}</td><td className="alterr">{pl.efficiency_perfect}</td>
                <td className="alterr">{pl.w?formatp(pl.efficiencyw):""}</td><td className="alterr">{pl.l?formatp(pl.efficiencyl):""}</td>
                <td>{formati(pl.workerloss)}</td><td>{pl.w?formati(pl.workerlossw):""}</td><td>{pl.l?formati(pl.workerlossl):""}</td>
            </tr>)}
        </tbody>
    </table>
    </center>
    </>
}