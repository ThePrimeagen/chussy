document.addEventListener('DOMContentLoaded', () => {
    const mlButton = document.createElement('button');
    mlButton.textContent = 'Train ML Bot';
    mlButton.style.position = 'fixed';
    mlButton.style.top = '10px';
    mlButton.style.right = '10px';
    mlButton.style.zIndex = '1000';
    mlButton.style.padding = '10px';
    mlButton.style.backgroundColor = '#ff6b6b';
    mlButton.style.color = 'white';
    mlButton.style.border = 'none';
    mlButton.style.borderRadius = '5px';
    mlButton.style.cursor = 'pointer';

    let training = false;
    mlButton.addEventListener('click', () => {
        training = !training;
        mlButton.textContent = training ? 'Stop Training' : 'Train ML Bot';
        mlButton.style.backgroundColor = training ? '#51cf66' : '#ff6b6b';
        
        if (window.socket) {
            window.socket.send(JSON.stringify({
                action: 'toggle_ml_training',
                ml_training: training
            }));
        }
    });

    document.body.appendChild(mlButton);
});
