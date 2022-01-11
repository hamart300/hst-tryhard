from stat import ST_CTIME
import os,json,pymongo,hashlib,sys,datetime

import analRep

def main(args):
    path="Replayek\\"
    files=os.listdir(path)
    numNewFiles=0
    out=[]
    for root,dirs,files in os.walk("Replayek"):
        for f in files:
            print("Parsing replay:"+root+"\\"+f)
            parser=analRep.parse(root+"\\"+f)
            out.append(parser)
            numNewFiles=numNewFiles+1
    print(str(numNewFiles)+ " new replays")
    #Update parsed files
    json.dump(out,open("results\\reps.json","w"),indent=4)

    return

if(__name__=="__main__"):
    main(sys.argv)