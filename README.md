# Laser Pattern Generator

## Purpose

This tool creates test generators for laser cutters.  
Mainly intended for finding the optimal power and feedrate for cutting and engraving.

## UI

On the left you can set all the parameters for the pattern generator.

The right hand side has buttons do copy the gcode or download a .gcode file.  
A textbox for viewing the gcode.  
A visual representation of the gcode. The slider on top determines the zoom level.

## Operation

The app generates a 2 dimensional pattern of square for testing.
There are currently 3 variables you can choose from:
- Feedrate (in mm/min)
- Power (0.0 - 1.0 aka %)
- Number of passes

Choose 2 variables to assign to the X and Y axis.   
The third will be fixed for all test squares.  

Choose your minimun, maximun and stepsize for the 2 variables  
Remember: The whole thing has to fit into your lasers bed size.

The "Size" field defines the size of the test squares.  
For engraving, don't choose too small a size.

Label - Text will be written on the bottom, after the X Axis label.  
Label - Feedrate determines the feedrate for writing all labels (power is always 100% for labels)

## Disclaimer

This project is rough around the edges. The main functionality is there, but a lot of polish is missing.  
And the app is a bit fragile when entering weird / invalid parameter combinations.

While the GCode it generates seemed fine in my tests, always do a sanity check in your preferred gcode viewing tool before running it.

Lasers are dangerous. If you blind yourself or burn your house down, it is your own fault.