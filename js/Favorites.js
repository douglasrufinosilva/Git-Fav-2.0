import { GithubUser } from './GithubUser.js'

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() { 
    this.entries = JSON.parse(localStorage.getItem('@github-favorites-2.0:')) || [] 
  }

  save() {
    localStorage.setItem('@github-favorites-2.0:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error('Usuário já existe!')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined || !user.login) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }

    this.clearInput()
  }

  delete(user) {
    const filteredEntries = this.entries
    .filter(entry => entry.login !== user.login) 
    
    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')
    
    this.update()
    this.onadd()
  }

  onadd() {
    const favoriteBtn = this.root.querySelector('.favorite-btn')

    favoriteBtn.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  clearInput() {
    const input = this.root.querySelector('.search input')

    input.value = ''
  }

  showEmptyTable() {
    if(this.entries.length === 0) {
      this.root.querySelector('.empty-table').classList.remove('hide-empty')
    } else {
      this.root.querySelector('.empty-table').classList.add('hide-empty')
    }
  }

  update() {
    this.showEmptyTable()

    this.removeAllTr()

    this.entries.forEach((user) => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user span').textContent = user.name
      row.querySelector('.user p').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const deleteUser = confirm('Deseja desfavoritar esse usuário?')

        if(deleteUser) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })

    this.clearInput()
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
    <td class="user">
      <img src="https://github.com/douglasrufinosilva.png" alt="Imagem de Douglas Rufino Silva">
      <a href="https://github.com/douglasrufinosilva"
      target="_blank">
      <span>Douglas Rufino Silva</span>
      <p>/douglasrufinosilva</p>
      </a>
    </td>

    <td class="repositories">
      123
    </td>

    <td class="followers">
      234
    </td>

    <td class="action">
      <button class="remove">Remover</button>
    </td>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
    .forEach((tr) => {
      tr.remove()
    })
    
  }
}