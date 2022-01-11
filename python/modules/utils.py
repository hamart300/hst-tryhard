class Units_counter:
    def __init__(self,startUnits={}):
        self.units=dict(startUnits)
    def push(self,unit,num):
        if(unit not in self.units.keys()):
            self.units[unit]=0
        self.units[unit]+=num
