# Auto-Wordle
**NOTE:** *I DO NOT condone or recommend the use of this program in actual wordle, it was only an experiment by myself for some fun!*

Demo: https://ezkidtrix.github.io/Auto-Wordle/

A p5.js program that auto solves a wordle game by using a list of all valid wordle words list by Dracos on GitHub (https://gist.github.com/dracos/dd0668f281e685bad51479e5acaadb93).

## How to use
Input the word in the status div into the wordle game. After wordle gives you a response to that word, you then input either "g", "y", or "b". "g" means that the column is green (in the correct position), "y" means that the column is yellow (the word has the letter in it but is not in the correct position), and "b" meaning that the word does not contain that letter. 

Input that into the main input in the 5-column letter pattern given on wordle (ex. bgybg (blank, green, yellow, blank, green)). Press submit, and it will calculate the next word you should input. If the word it suggests is not valid (wordle says it's not a word), then just press escape and it will give a new one to try.

## Actual Sucesses/Sucess Rate
I haven't actually really took the time to calculate the full average success rate. However, from my testing, it seems to get the correct word on row 4 most of the time, row 3 or 5 occasionally, and 1 or 6 I don't really seem to see or are just very rare. If anyone would like to calculate the actual success rate, feel free to do that yourself and on your own time!

## Actual Practicality
In my opinion, this should only really be used for experimenting or if you just want to have some fun. You can use it on the actual wordle game, however I DO NOT condone or recommend the use of this program in actual an wordle game. This is just an experiment I did myself with the help of a little AI (to make it easier for me to understand how the algorithm works) and the original idea came from a YouTube video (https://www.youtube.com/watch?v=v68zYyaEmEA) from the popular channel called "3Blue1Brown" (https://www.youtube.com/@3blue1brown) where they did something similar. Which the original logic and methods also did come from that exact video which I ported to p5.js.