import{j as e}from"./index-DzBq-Y8X.js";const s=({title:a,description:t})=>e.jsx("div",{className:"card project-card",children:e.jsxs("div",{className:"card-body",children:[e.jsx("h5",{className:"card-title",children:a}),e.jsx("p",{children:t})]})}),n=[{title:"Paxos",description:"Designed and implemented a fault-tolerant distributed system using the Paxos consensus algorithm, ensuring consistency and replication across multiple nodes. Developed code in Java to handle each phase of the algorithm and implemented communication protocols for nodes to reach a consensus."},{title:"NFL Fantasy Picker",description:"Developed a real-time Full Stack application using React and Node.js, dynamically predicting the top ten starting players and updating scores based on real-time data. Constructed and maintained an SQL database housing comprehensive data on 50 NFL players."},{title:"Comparing Paxos to Raft",description:"Explained how to implement Paxos and Raft and the trade-offs between the two, simulating them for a sample workload to compare their operation."}],i=()=>e.jsx("section",{id:"projects",className:"section py-5",children:e.jsxs("div",{className:"container",children:[e.jsx("h2",{className:"section-title text-center",children:"Projects"}),e.jsx("div",{className:"row",children:n.map((a,t)=>e.jsx("div",{className:"col-md-4 mb-4",children:e.jsx(s,{...a})},t))})]})});export{i as default};