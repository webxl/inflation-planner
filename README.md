# Inflation Planner

[Inflation Planner](https://inflation-planner.vercel.app/)

Inflation Planner is a simple web application that helps you plan for inflation. It allows you to calculate the future
value of your savings based on the current value, interest rate, rate or return, contributions, withdrawals and
retirement time frame.

Developed using React, TypeScript, [Chakra UI](https://v2.chakra-ui.com/), [Nivo](https://nivo.rocks/) & Vite.

## Features

- Calculates a savings balance over time, factoring in:
    - initial balance
    - monthly contributions
    - withdrawal amount
    - withdrawal (retirement) start and end dates
    - expected rate of return
    - and last but not least, inflation rate
- Graphs the savings balance over time using an interactive chart
    - highlights the date contributions end and withdrawals begin
    - shows any shortfall in a different color
- Allows the user to automatically correct a shortfall and conditionally keep the adjusted parameter value

TODO:

- add more inflation statistics
- add parameters to URL for sharing
- ~~make parameters sticky using local storage~~
- add monte carlo simulations
