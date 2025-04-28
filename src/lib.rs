mod serialize;
mod simulation;
mod vector;

use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::{from_value, to_value};
use simulation::{Body, Simulation};
use wasm_bindgen::prelude::*;

#[derive(Deserialize, Serialize)]
pub struct WasmInput {
    steps: usize,
    time_step: f64,
    sample_rate: usize,
    starting_bodies: Vec<Body>,
}

#[wasm_bindgen]
pub fn simulate(input: JsValue) -> Result<JsValue, JsValue> {
    let raw_input_struct: Result<WasmInput, _> = from_value(input);
    let input_struct = match raw_input_struct {
        Ok(ok_struct) => ok_struct,
        Err(e) => {
            let error_msg = format!("Error parsing struct: {}", e);
            return Err(JsValue::from_str(&error_msg));
        }
    };
    let mut simulation = Simulation::new(
        input_struct.starting_bodies,
        input_struct.time_step,
        input_struct.sample_rate,
    );
    for _ in 0..input_struct.steps {
        simulation.calculate_next_step();
    }
    let traces = serialize::from_simulation(simulation);
    match to_value(&traces) {
        Ok(response) => Ok(response),
        Err(e) => {
            let error_msg = format!("Error parsing struct: {}", e);
            Err(JsValue::from_str(&error_msg))
        }
    }
}
