mod serialize;
mod simulation;
mod vector;

use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::{from_value, to_value};
use simulation::{Body, Simulation};
use vector::float2;
use wasm_bindgen::prelude::*;

#[derive(Deserialize, Serialize)]
pub struct WasmSimInput {
    total_time: u64,
    time_step: f64,
    sample_rate: usize,
    starting_bodies: Vec<Body>,
}

#[wasm_bindgen]
pub fn simulate(input: JsValue) -> Result<JsValue, JsValue> {
    let raw_input_struct: Result<WasmSimInput, _> = from_value(input);
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

    let steps: u64 = (input_struct.total_time as f64 / input_struct.time_step) as u64;
    for _ in 0..steps {
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

#[derive(Deserialize, Serialize)]
pub struct WasmStableInput {
    starting_bodies: Vec<Body>,
}
#[derive(Deserialize, Serialize)]
pub struct StableResponse {
    body1_vel: float2,
    body2_vel: float2,
}

#[wasm_bindgen]
pub fn stable_orbit(input: JsValue) -> Result<JsValue, JsValue> {
    let raw_input_struct: Result<WasmStableInput, _> = from_value(input);
    let input_struct = match raw_input_struct {
        Ok(ok_struct) => ok_struct,
        Err(e) => {
            let error_msg = format!("Error parsing struct: {}", e);
            return Err(JsValue::from_str(&error_msg));
        }
    };
    let simulation = Simulation::new(input_struct.starting_bodies, 0_f64, 0_usize);

    let (body1_vel, body2_vel) = match simulation.calculate_stable_orbit_velocities() {
        Ok(output) => output,
        Err(e) => {
            let error_msg = format!("Error calculating velocities: {}", e);
            return Err(JsValue::from_str(&error_msg));
        }
    };

    let stable_resp = StableResponse {
        body1_vel,
        body2_vel,
    };

    match to_value(&stable_resp) {
        Ok(response) => Ok(response),
        Err(e) => {
            let error_msg = format!("Error returing struct: {}", e);
            Err(JsValue::from_str(&error_msg))
        }
    }
}
