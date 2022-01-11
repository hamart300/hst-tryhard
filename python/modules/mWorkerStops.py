from .moduleBase import *

class wsPDC():
    def __init__(self):
        self.out=""
        self.lastworker=0
        self.bestworkers=0
        self.workers=0

class mWorkerStops(ModuleBase):
    def __init__(self):
        ModuleBase.__init__(self)
        self.name="Worker stops Module"
        self.outName="worker_stops"
    def _setupPDC(self):
        return wsPDC()
    def _feed(self,ev,pdc):
        if(ev.name=="UnitBornEvent"):
            uname=resolve(ev.unit)
            if(uname in WORKERS):
                if(pdc.lastworker+60<self.toSec(ev.frame) and pdc.workers==pdc.bestworkers):
                    pdc.out+=str(pdc.workers)+">"
                pdc.lastworker=self.toSec(ev.frame)
                pdc.workers+=1
                if(pdc.workers>pdc.bestworkers):
                    pdc.bestworkers=pdc.workers
        if(ev.name=="UnitDiedEvent")            :
            uname=resolve(ev.unit)
            if(uname in WORKERS):
                pdc.workers-=1
        return
    def _finish(self,pdc):
        return pdc.out+str(pdc.bestworkers)

