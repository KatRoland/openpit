import Docker, { ContainerInfo } from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export const listContainers = async () => {
    try {
        const containers = await docker.listContainers({ all: true });
        
        if(!containers) {
            return { error: "no_containers_found" };
        }

        return containers.map((container: ContainerInfo) => ({
            id: container.Id.substring(0, 12),
            name: container.Names[0].replace('/', ''),
            image: container.Image,
            state: container.State,
            status: container.Status
        }));
    } catch (err) {
        console.error("Docker hiba:", err);
        return { error: "docker_error" };
    }
};


// remove this after implementing the actual create function
export async function testFn() {

    const stream = await docker.pull('nginx:latest');

    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err:any, reso:any) => {
        if (err) return reject(err);
        resolve(reso);
      });
    });

  const container = await docker.createContainer({
    Image: 'nginx:latest',
    name: 'test-nginx-container',
    ExposedPorts: {
      '80/tcp': {}
    },
    HostConfig: {
      PortBindings: {
        '80/tcp': [{ HostPort: '8080' }]
      }
    }
  });

  await container.start();
  console.log('port:8080');
  return { success: true };
}

export const toggleContainer = async (id: string, action: string) => {
    const container = docker.getContainer(id);
    if (action === 'start') await container.start();
    if (action === 'stop') await container.stop();
    return { success: true };
};