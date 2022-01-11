from .moduleBase import *
from .utils import Units_counter

class mUnits(ModuleBase):
    def __init__(self):
        ModuleBase.__init__(self)
        self.name="Units Module"
        self.outName="units"
    def _setupPDC(self):
        return {'unms':[],'out':[],'uctr':Units_counter()}
    def _feed(self,ev,pdc):
        if(ev.name=="UnitBornEvent" or ev.name=="UnitInitEvent" or ev.name=="UnitTypeChangeEvent"):
            uname=resolve(ev.unit)
            if(uname in UNITS+WORKERS):
                pdc['uctr'].push(uname,1)
                if(uname not in pdc['unms']):
                    pdc['unms'].append(uname)
                    pdc['out'].append({'name':uname,'timing':self.toSec(ev.frame)})

        return
    def _finish(self,pdc):
        for sv in pdc['out']:
            sv['count']=pdc['uctr'].units[sv['name']]
        return pdc['out']

