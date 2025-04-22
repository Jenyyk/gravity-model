mod serialize;
mod simulation;
mod vector;

use simulation::{Body, Simulation};
use vector::float2;

fn main() {
    let starting_bodies = vec![
        Body {
            position: float2::new(-1e9_f64, 0_f64),
            mass: 5e24_f64,
            velocity: float2::new(0_f64, -250_f64),
            acceleration: float2::empty(),
        },
        Body {
            position: float2::new(1e9_f64, 0_f64),
            mass: 5e24_f64,
            velocity: float2::new(0_f64, 250_f64),
            acceleration: float2::empty(),
        },
        Body {
            position: float2::new(0_f64, 1.5e9_f64),
            mass: 1e24_f64,
            velocity: float2::new(-500_f64, 0_f64),
            acceleration: float2::empty(),
        },
    ];

    let mut simulation = Simulation::new(starting_bodies, 2_f64, 5000);

    for _ in 0..=50000000 {
        simulation.calculate_next_step();
    }
    simulation.log_last_state();

    let traces = serialize::from_simulation(simulation);
    serialize::save_file(&traces);
}
