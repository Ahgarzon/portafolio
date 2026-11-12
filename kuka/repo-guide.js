(() => {
 'use strict';
 const $=s=>document.querySelector(s);
 const base='https://github.com/REZ3LIET/KUKA-ROS2/blob/8f2c2a35a2d45d5739c7a247d5872e514a8d4895/';
 const messages={
  move:['control_actions/action/Move','string action\nfloat64 speed\nJoints movej\nXyz movel\nXyzypr moverp\nfloat64 moveg\n---\nstring result\n---\nstring feedback','Tres secciones: objetivo, resultado y feedback. Revisar el texto result además del estado de la acción: el servidor también llama succeed() en algunas ramas de fallo.',base+'kuka_control/control_actions/action/Move.action'],
  joints:['control_actions/msg/Joints','float64 joint1\nfloat64 joint2\nfloat64 joint3\nfloat64 joint4\nfloat64 joint5\nfloat64 joint6','En este contrato personalizado los valores de MoveJ entran en grados. move_joints.cpp los convierte a radianes antes de fijar el objetivo de MoveIt.',base+'kuka_control/control_actions/msg/Joints.msg'],
  pose:['control_actions/msg/Xyzypr','float64 x\nfloat64 y\nfloat64 z\nfloat64 yaw\nfloat64 pitch\nfloat64 roll','Para MoveRP: posición asignada en el marco de planificación; yaw/pitch/roll en grados, convertidos a cuaternión por move_xyzw.cpp. Confirmar siempre base y herramienta. No es un geometry_msgs/Pose.',base+'kuka_control/control_actions/msg/Xyzypr.msg'],
  trajectory:['control_msgs/action/FollowJointTrajectory','OBJETIVO (resumen; no definición completa)\ntrajectory_msgs/JointTrajectory trajectory\n  string[] joint_names\n  JointTrajectoryPoint[] points\n    float64[] positions\n    float64[] velocities\n    builtin_interfaces/Duration time_from_start\n\nRESULTADO: error_code y error_string\nFEEDBACK: desired, actual, error','Interfaz estándar configurada por MoveIt para el controlador. Las articulaciones rotativas se expresan en radianes; los puntos incluyen tiempo. Consultar la definición completa y verificar el endpoint con ros2 action list -t.','https://github.com/ros-controls/control_msgs/blob/humble/control_msgs/action/FollowJointTrajectory.action'],
  state:['sensor_msgs/msg/JointState','std_msgs/Header header\nstring[] name\nfloat64[] position\nfloat64[] velocity\nfloat64[] effort','El broadcaster publica estado articular. Emparejar name con los valores y comprobar timestamp, unidades y origen real. En una articulación rotativa: rad, rad/s y N·m cuando estén disponibles.','https://github.com/ros2/common_interfaces/blob/humble/sensor_msgs/msg/JointState.msg']
 };
 function showMessage(){const m=messages[$('#message-choice').value];$('#message-title').textContent=m[0];$('#message-code').textContent=m[1];$('#message-note').textContent=m[2];$('#message-source').href=m[3];}
 $('#message-choice').addEventListener('change',showMessage);showMessage();
 const commands={
 prepare:['Workspace de estudio',`# Ubuntu 22.04 + ROS 2 Humble ya instalados
source /opt/ros/humble/setup.bash
mkdir -p ~/kuka_ws/src
cd ~/kuka_ws/src
git clone https://github.com/REZ3LIET/KUKA-ROS2.git
cd KUKA-ROS2
git checkout 8f2c2a35a2d45d5739c7a247d5872e514a8d4895
cd ~/kuka_ws
# rosdep instalado e inicializado previamente
rosdep install --from-paths src --ignore-src -r -y --rosdistro humble
colcon build --symlink-install
source install/setup.bash`,'Procedimiento propuesto, no ejecutado aquí. El README enumera dependencias; comprobar su disponibilidad Humble. La cabecera move_group_interface_improved.h no está incluida en el árbol revisado: resolver su procedencia/compatibilidad antes de esperar una compilación reproducible.'],
 single:['Arranque de simulación',`source /opt/ros/humble/setup.bash
source ~/kuka_ws/install/setup.bash
export ROS_DOMAIN_ID=30
ros2 launch kuka_gazebo kuka_bringup.launch.py \\
  ign_gz:=True use_sim_time:=True \\
  robot_name:=arm_1 namespace:=arm_1 gripper_name:=""`,'El launch usa use_sim_time. El README escribe use_sime_time: se corrige aquí conforme al código. El argumento ign_gz inicia Gazebo; False sólo evita abrir otra instancia de Gazebo, no selecciona hardware físico.'],
 multi:['Varias instancias en Gazebo',`source /opt/ros/humble/setup.bash
source ~/kuka_ws/install/setup.bash
export ROS_DOMAIN_ID=30
# Primero revisar robot_list en multi_kuka_bringup.launch.py
ros2 launch kuka_gazebo multi_kuka_bringup.launch.py`,'El archivo incluye el bringup por robot con ign_gz=False porque Gazebo ya está iniciado. Comprobar /Move, nodos internos, TF, articulaciones y controladores antes de enviar objetivos a varias instancias.'],
 bridge:['Puente WebSocket adicional',`# Otra terminal; paquete rosbridge_server compatible instalado
source /opt/ros/humble/setup.bash
source ~/kuka_ws/install/setup.bash
export ROS_DOMAIN_ID=30
ros2 launch rosbridge_server rosbridge_websocket_launch.xml port:=9090
# Unity: ws://<IP_DEL_PC_ROS>:9090
# Ejemplo de dominio único: namespaces distintos por robot`,'RosBridge se añade a la arquitectura: no forma parte del launch KUKA revisado. El overlay permite resolver control_actions. Verificar la compatibilidad de acciones ROS 2 del cliente/servidor; publicar Action.msg en un tópico no invoca /Move.'],
 inspect:['Consultas de introspección',`source /opt/ros/humble/setup.bash
source ~/kuka_ws/install/setup.bash
export ROS_DOMAIN_ID=30
ros2 launch kuka_gazebo kuka_bringup.launch.py --show-args
ros2 node list
ros2 action list -t
ros2 interface show control_actions/action/Move
ros2 interface show control_msgs/action/FollowJointTrajectory
ros2 interface show sensor_msgs/msg/JointState
ros2 control list_controllers -c /arm_1/controller_manager
ros2 topic list -t
# Sólo si la ruta aparece en la lista:
ros2 topic echo /arm_1/joint_states --once`,'Estos comandos inspeccionan argumentos e interfaces; no envían objetivos de movimiento. Los nombres efectivos se obtienen de la instancia en ejecución: las rutas aquí son ejemplos.'],
 sample:['Ejemplo de movimiento del autor del repositorio',`# Referencia del README; únicamente en simulación revisada
cd ~/kuka_ws/src/KUKA-ROS2/kuka_control/control_scripts/scripts
# Leer y adaptar main() antes de ejecutar:
# python3 action_helper.py

# Para estudiar el contrato sin enviar un goal:
ros2 interface show control_actions/action/Move
ros2 action info /Move`,'action_helper.py contiene una secuencia que sí solicita movimientos si se ejecuta. Se muestra comentado para estudio. No es un comando de conexión física ni una secuencia validada para la celda. MoveJ/MoveL/MoveRP tienen semánticas y unidades diferentes.']
 };
 function showCommand(){const c=commands[$('#command-choice').value];$('#command-title').textContent=c[0];$('#command-code').textContent=c[1];$('#command-note').textContent=c[2];}
 $('#command-choice').addEventListener('change',showCommand);showCommand();
 $('#copy-command').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#command-code').textContent);$('#copy-command').textContent='Copiado';setTimeout(()=>$('#copy-command').textContent='Copiar',1600);}catch{$('#copy-command').textContent='Seleccionar y copiar';}});
})();
