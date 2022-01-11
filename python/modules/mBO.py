from .moduleBase import *

class mBO(ModuleBase):
    def __init__(self):
        ModuleBase.__init__(self)
        self.name="BO module"
        self.outName="start_bo"
    def _setupPDC(self):
        return []
    def _feed(self,ev,pdc):
        if(ev.name=="UnitInitEvent"):
            uname=ev.unit
            if(uname in OPBUILDINGS and len(pdc)<6):
                pdc.append({'name':uname,'timing':self.toSec(ev.frame)})
    def _finish(self,pdc):
        return pdc

