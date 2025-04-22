use crate::simulation::*;
use std::fs::File;

use serde::Serialize;
#[derive(Clone, Debug, Serialize)]
pub struct Trace {
    x: Vec<f64>,
    y: Vec<f64>,
    mode: String,
    r#type: String,
}

pub fn from_simulation(simulation: Simulation) -> Vec<Trace> {
    let states = simulation.get_states();
    let num_bodies = states.first().map_or(0, |state| state.get_bodies().len());

    let mut traces = vec![
        Trace {
            x: Vec::with_capacity(states.len()),
            y: Vec::with_capacity(states.len()),
            mode: String::from("markers"),
            r#type: String::from("scatter"),
        };
        num_bodies
    ];

    for state in states.iter() {
        for (i, body) in state.get_bodies().iter().enumerate() {
            if i < num_bodies {
                traces[i].x.push(body.get_x());
                traces[i].y.push(body.get_y());
            }
        }
    }
    traces
}

pub fn save_file(traces: &Vec<Trace>) {
    let file = File::create("data.json").unwrap();
    serde_json::to_writer(file, traces).unwrap();
}
