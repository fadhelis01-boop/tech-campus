Terraform crée les machines ; il faut ensuite les **configurer** : installer des paquets, déposer des fichiers de configuration, démarrer des services. C'est le domaine de la **gestion de configuration**, dont **Ansible** est l'outil le plus populaire.

## Les principes d'Ansible

- **Sans agent** : Ansible se connecte aux machines en SSH, rien à installer dessus.
- **Déclaratif et idempotent** : on décrit l'état voulu (« le paquet nginx est installé ») ; relancer ne change rien si c'est déjà le cas.
- **YAML** : les **playbooks** sont des fichiers YAML lisibles.

## Inventaire et playbook

L'**inventaire** liste les machines, groupées :

```ini
[web]
web1.example.com
web2.example.com

[bases]
base1.example.com
```

Le **playbook** décrit ce qu'il faut faire sur quels groupes :

```yaml
- name: Configurer les serveurs web
  hosts: web
  become: true
  tasks:
    - name: Installer nginx
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true

    - name: Déployer la page d'accueil
      ansible.builtin.copy:
        src: index.html
        dest: /var/www/html/index.html

    - name: Démarrer nginx au démarrage
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true
```

```bash
ansible-playbook -i inventaire.ini site.yml
```

- `hosts` : le groupe de machines ciblé ;
- `become: true` : exécuter avec les droits d'administrateur ;
- chaque tâche appelle un **module** (`apt`, `copy`, `service`, `template`, `user`…) avec l'état voulu.

## Terraform et Ansible ensemble

| Terraform | Ansible |
|---|---|
| crée et supprime l'infrastructure | configure ce qui tourne dessus |
| garde un état | sans état (vérifie à chaque exécution) |
| idéal pour les ressources cloud | idéal pour les systèmes et logiciels |

:::futur Tendance
Avec les conteneurs et Kubernetes, on configure de moins en moins des machines « à la main » : on construit des **images** (immuables) et on les remplace. Ansible reste très utilisé pour les parcs de serveurs existants, les équipements réseau et l'automatisation d'opérations.
:::

## À retenir

- Ansible : sans agent (SSH), idempotent, playbooks YAML.
- Inventaire (machines par groupes) + playbook (tâches par groupe) + modules (apt, copy, service…).
- `ansible-playbook -i inventaire site.yml`.
- Terraform crée, Ansible configure ; l'infrastructure immuable réduit le besoin de configuration manuelle.
