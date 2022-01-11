from .moduleBase import *

class mTemlate(ModuleBase):
    def __init__(self):
        ModuleBase.__init__(self)
        self.name="Test Module"
        self.outName="test"
    def _setupPDC(self):
        return {}
    def _feed(self,ev,pdc):
        return
    def _finish(self,pdc):
        return pdc

